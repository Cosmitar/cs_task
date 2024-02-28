// HELPERS
const COMMENT_PATH_SEPARATOR = "|";

export const parseDepth = (commentPath: string) =>
  commentPath.split(COMMENT_PATH_SEPARATOR).length;

export const buildPath = (parentPath: string, currentId: string) =>
  `${parentPath}${COMMENT_PATH_SEPARATOR}${currentId}`;
