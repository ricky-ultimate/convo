module.exports = {
    testEnvironment: "node",
    transform: {
      "^.+\\.(ts|tsx|js|jsx)$": "babel-jest", // Use babel-jest for all relevant file extensions
    },
    testPathIgnorePatterns: ["/node_modules/", "/.next/"],
    setupFilesAfterEnv: [],
    moduleNameMapper: {
      "^@/(.*)$": "<rootDir>/src/$1",
    },
    transformIgnorePatterns: [
      "/node_modules/(?!next-auth|@next-auth|@auth|@prisma|oauth4webapi)/" // Include oauth4webapi and other ES module dependencies
    ],
    extensionsToTreatAsEsm: [".ts", ".tsx"], // Treat these extensions as ES modules
  };
