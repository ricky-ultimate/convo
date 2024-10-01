module.exports = {
    testEnvironment: "node",
    transform: {
      "^.+\\.tsx?$": "ts-jest",
    },
    testPathIgnorePatterns: ["/node_modules/", "/.next/"],
    setupFilesAfterEnv: [],
    moduleNameMapper: {
      "^@/(.*)$": "<rootDir>/src/$1",
    },
  };
