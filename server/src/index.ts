/* istanbul ignore file */

import { error } from '@anmiles/logger';
import { run } from './lib/app';

run().catch((ex) => {
	error(ex);
	process.exit(1);
});
