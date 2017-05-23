import * as PrettyError from 'pretty-error';
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
/********************************************* EXPORT *********************************************/
export interface GlobalNodeErrorHandlersSetupType {
    (): PrettyError;
    uncaughtExceptionHandlerSetup: (quitOnError?: boolean) => PrettyError;
    catchUnhandledRejectionErrorsSetup: (pe: PrettyError) => PrettyError;
}
/**
 *  Merge exports into a useful namespace. Just running the top-level item sets all handlers
 *  up in Node, but more granularity is available by accessing the individual handler types on
 *  the function object (top-level item), rather than running it.
 *
 *  @return {Object/Function} Runnable function object that automatically sets up pretty error
 *                            handling across an entire Node application when run. Returns a
 *                            PrettyError factory that displays given string as styled error text.
 */
export declare const GlobalNodeErrorHandlersSetup: GlobalNodeErrorHandlersSetupType;
