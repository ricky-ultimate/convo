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
    transformIgnorePatterns: [
      "node_modules/(?!(next-auth|@next-auth|@auth|@prisma)/)" // Add exceptions for ES modules
    ],
  };
