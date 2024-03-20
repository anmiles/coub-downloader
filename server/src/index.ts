/* istanbul ignore file */

import { error } from '@anmiles/logger';
import { run } from './lib/app';

run().catch((ex: unknown) => {
	error(ex);
	process.exit(1);
});
