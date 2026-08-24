const soundFiles = import.meta.glob("./sounds/*.mp3", {
  eager: true,
  query: "?url",
  import: "default",
});

export const getSoundUrl = (fileName) => {
  if (!fileName) {
    return null;
  }

  const key = `./sounds/${fileName}`;

  return soundFiles[key] ?? null;
};
