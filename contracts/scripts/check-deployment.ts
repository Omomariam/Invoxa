import { preflight } from './preflight';
preflight().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
