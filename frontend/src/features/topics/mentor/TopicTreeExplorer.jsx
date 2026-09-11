import { useState } from "react";
import { ChevronRight, ChevronDown, FolderPlus, FileText, ClipboardList, Plus, Trash2 } from "lucide-react";
import ConfirmModal from "../../../components/ConfirmModal";
import { createTopic, deleteTopic } from "../../../services/topicService";
import { getContentPreviewLabel } from "../../../utils/sentenceBlocks";
import toast from "react-hot-toast";

// Recursive Collapsible Tree Explorer — mentor Content Manager for the
// Hierarchical Content Tree (Course -> recursive Topics -> Content /
// Assessments). Every node (including the course root) can add a
// sub-topic, content, or assessment; every non-root topic can be
// deleted (CASCADEs its sub-tree; its own contents/assessments SET NULL
// back to the course root — see the tree migration).
//
// This sits ALONGSIDE the existing flat Sentences/Exercises tabs in
// LessonDetailPage.jsx rather than replacing them — those tabs list
// every sentence/exercise in the lesson regardless of topic_id, so
// nothing placed into a topic here goes missing from flat management.
// The tree is purely an organizational + creation layer on top.

function TopicNode({ node, depth, onAddSubtopic, onAddContent, onAddAssessment, onDeleteTopic, isRoot }) {
  const [expanded, setExpanded] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const contents = node.contents || [];
  const assessments = node.assessments || [];
  const children = node.children || [];
  const hasContent = contents.length + assessments.length + children.length > 0;

  return (
    <div style={{ marginLeft: isRoot ? 0 : 20 }}>
      <div className="flex items-center gap-2 py-2 group">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 cursor-pointer shrink-0"
          disabled={!hasContent}
        >
          {hasContent ? (expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />) : null}
        </button>

        <span className={`font-semibold ${isRoot ? "text-gray-800" : "text-gray-700"}`}>
          {isRoot ? "Course Root" : node.title}
        </span>

        <span className="text-xs text-gray-400">
          {contents.length} content · {assessments.length} assessment{assessments.length === 1 ? "" : "s"}
          {!isRoot && ` · ${children.length} sub-topic${children.length === 1 ? "" : "s"}`}
        </span>

        <div className="flex items-center gap-1 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={() => onAddSubtopic(node)}
            title="Add Sub-topic"
            className="w-7 h-7 rounded-lg hover:bg-indigo-50 text-indigo-600 flex items-center justify-center cursor-pointer"
          >
            <FolderPlus size={14} />
          </button>
          <button
            type="button"
            onClick={() => onAddContent(node)}
            title="Add Content"
            className="w-7 h-7 rounded-lg hover:bg-indigo-50 text-indigo-600 flex items-center justify-center cursor-pointer"
          >
            <FileText size={14} />
          </button>
          <button
            type="button"
            onClick={() => onAddAssessment(node)}
            title="Add Assessment"
            className="w-7 h-7 rounded-lg hover:bg-indigo-50 text-indigo-600 flex items-center justify-center cursor-pointer"
          >
            <ClipboardList size={14} />
          </button>
          {!isRoot && (
            <button
              type="button"
              onClick={() => setDeleteModalOpen(true)}
              title="Delete Topic"
              className="w-7 h-7 rounded-lg hover:bg-red-50 text-red-600 flex items-center justify-center cursor-pointer"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {expanded && (
        <div className="border-l border-gray-100 pl-2 ml-3">
          {contents.map((content) => (
            <div key={`c-${content.id}`} className="flex items-center gap-2 py-1.5 text-sm text-gray-600">
              <FileText size={13} className="text-gray-400 shrink-0" />
              {getContentPreviewLabel(content)}
            </div>
          ))}
          {assessments.map((assessment) => (
            <div key={`a-${assessment.id}`} className="flex items-center gap-2 py-1.5 text-sm text-gray-600">
              <ClipboardList size={13} className="text-gray-400 shrink-0" />
              {assessment.title}
            </div>
          ))}
          {children.map((child) => (
            <TopicNode
              key={child.id}
              node={child}
              depth={depth + 1}
              onAddSubtopic={onAddSubtopic}
              onAddContent={onAddContent}
              onAddAssessment={onAddAssessment}
              onDeleteTopic={onDeleteTopic}
            />
          ))}
        </div>
      )}

      {!isRoot && (
        <ConfirmModal
          isOpen={deleteModalOpen}
          title="Delete Topic"
          message={`Delete "${node.title}"? Sub-topics under it are deleted too. Its own content and assessments move back to the course root instead of being deleted.`}
          onConfirm={() => {
            setDeleteModalOpen(false);
            onDeleteTopic(node);
          }}
          onCancel={() => setDeleteModalOpen(false)}
        />
      )}
    </div>
  );
}

// tree: { course, root: {contents, assessments}, topics: [] } — see
// backend/controllers/topicController.js#getCourseTree.
// onOpenContentDrawer(topicId) / onOpenAssessmentDrawer(topicId) let the
// parent page (LessonDetailPage) reuse its existing sentence/exercise
// creation drawers, scoped to whichever node was clicked.
function TopicTreeExplorer({ lessonId, tree, onRefresh, onOpenContentDrawer, onOpenAssessmentDrawer }) {
  if (!tree) return null;

  const handleAddSubtopic = async (node) => {
    const title = window.prompt("Sub-topic title:");
    if (!title || !title.trim()) return;
    try {
      await createTopic(lessonId, {
        title: title.trim(),
        parent_id: node.id === "root" ? null : node.id,
      });
      toast.success("Topic created successfully");
      onRefresh();
    } catch (error) {
      console.error(error);
      toast.error("Failed to create topic");
    }
  };

  const handleDeleteTopic = async (node) => {
    try {
      await deleteTopic(node.id);
      toast.success("Topic deleted successfully");
      onRefresh();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete topic");
    }
  };

  const rootNode = {
    id: "root",
    title: "Course Root",
    contents: tree.root.contents,
    assessments: tree.root.assessments,
    children: tree.topics,
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Content Structure</h2>
        <button
          type="button"
          onClick={() => handleAddSubtopic(rootNode)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 cursor-pointer"
        >
          <Plus size={16} />
          Add Topic
        </button>
      </div>
      <p className="text-sm text-gray-400 mb-4">
        Organize this course into topics and sub-topics. Hover a node for actions. Content already
        shown here also appears in the flat Sentences / Assessments tabs above.
      </p>

      <TopicNode
        node={rootNode}
        depth={0}
        isRoot
        onAddSubtopic={handleAddSubtopic}
        onAddContent={(node) => onOpenContentDrawer(node.id === "root" ? null : node.id)}
        onAddAssessment={(node) => onOpenAssessmentDrawer(node.id === "root" ? null : node.id)}
        onDeleteTopic={handleDeleteTopic}
      />
    </div>
  );
}

export default TopicTreeExplorer;
