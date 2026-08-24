import VocalTract from "./VocalTract/VocalTract";

const PhonemeMouthAnimation = ({ metadata, width = 700, height = 500 }) => {
  const animation = metadata?.animation;

  if (!animation?.articulation) {
    return null;
  }

  return (
    <VocalTract
      phoneme={animation}
      width={width}
      height={height}
      speed={1}
      showLabels={true}
      showAirflow={true}
      loop={true}
    />
  );
};

export default PhonemeMouthAnimation;
