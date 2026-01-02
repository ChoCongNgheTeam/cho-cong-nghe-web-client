import type { Config } from "tailwindcss";

const config: Config = {
   content: [
      "./app/(client)/**/*.{js,ts,jsx,tsx}",
      "./app/(admin)/**/*.{js,ts,jsx,tsx}",
      "./app/components/**/*.{js,ts,jsx,tsx}",
   ],
   
};

export default config;
