import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * PGlite — локальная замена Postgres, лежит в devDependencies и подключается
   * динамически, только когда нет DATABASE_URL. Держим его вне бандла,
   * чтобы сборщик не пытался разрешить его в проде.
   */
  serverExternalPackages: ["@electric-sql/pglite"],
};

export default nextConfig;
