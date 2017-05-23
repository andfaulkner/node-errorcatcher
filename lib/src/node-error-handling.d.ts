import * as PrettyError from 'pretty-error';
/**************************************** TYPE DEFINITIONS ****************************************/
export interface GlobalNodeErrorHandlersSetupType {
    (): PrettyError;
    uncaughtExceptionHandlerSetup: (quitOnError?: boolean) => PrettyError;
    catchUnhandledRejectionErrorsSetup: (pe: PrettyError) => PrettyError;
}
/**
 * Makes errors beautiful, throughout the entire app.
 * Performs modifications of the global environment - changes propagate everywhere.
 *
 * Colours and properly spaces error messages.
 * Removes node 'core' modules from the error output.
 * Eliminates 'bluebird', 'lodash', 'express', and 'async' from the stacktrace.
 *
 * @return {PrettyError} Instance of PrettyError module core class, for directly
 *                       rendering error text in other handler setup functions.
 */
export declare function prettyErrorFactory(): PrettyError;
export declare const GlobalNodeErrorHandlersSetup: GlobalNodeErrorHandlersSetupType;
