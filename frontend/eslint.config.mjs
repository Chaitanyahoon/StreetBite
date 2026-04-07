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
    {
        rules: {
            "react/no-unescaped-entities": "off",
            "react-hooks/set-state-in-effect": "warn",
            "react-hooks/purity": "warn",
            "react-hooks/immutability": "warn",
        },
    },
];

export default config;
