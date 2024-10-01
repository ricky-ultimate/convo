module.exports = {
    testEnvironment: "node",
    transform: {
      "^.+\\.tsx?$": "ts-jest",
    },
    testPathIgnorePatterns: ["/node_modules/", "/.next/"],
    setupFilesAfterEnv: ["@testing-library/jest-dom/extend-expect"],
  };
