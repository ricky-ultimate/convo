module.exports = {
    testEnvironment: "node",
    transform: {
      "^.+\\.(ts|tsx)$": "babel-jest", // Use babel-jest to handle TypeScript and ES modules
      "^.+\\.(js|jsx|mjs|cjs)$": "babel-jest", // Use babel-jest for JS files
    },
    testPathIgnorePatterns: ["/node_modules/", "/.next/"],
    setupFilesAfterEnv: [],
    moduleNameMapper: {
      "^@/(.*)$": "<rootDir>/src/$1",
    },
    transformIgnorePatterns: [
      "/node_modules/(?!next-auth|@next-auth|@auth|@prisma)" // Transform these specific ES module dependencies
    ],
    globals: {
      "ts-jest": {
        useESM: true, // Use ES Module support in ts-jest
      },
    },
    extensionsToTreatAsEsm: [".ts", ".tsx"], // Treat these files as ES modules
  };
