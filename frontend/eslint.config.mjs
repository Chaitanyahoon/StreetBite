import nextVitals from "eslint-config-next/core-web-vitals";

const config = [
    {
        ignores: [
            ".next/**",
            "node_modules/**",
            "public/firebase-messaging-sw.js",
        ],
    },
    ...nextVitals,
];

export default config;
