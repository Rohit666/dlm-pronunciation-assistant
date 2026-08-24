const videoFiles = import.meta.glob("./videos/*.mp4", {
  eager: true,
  query: "?url",
  import: "default",
});

export const getVideoUrl = (fileName) => {
  if (!fileName) {
    return null;
  }

  const key = `./videos/${fileName}`;
  const url = videoFiles[key];
  return url ? decodeURI(url) : null;
};
