"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_root_path_1 = require("app-root-path");
const PrettyError = require("pretty-error");
const moment = require("moment");
const _ = require("lodash");
/******************************************** LOGGING *********************************************/
const node_1 = require("mad-logs/lib/node");
const TAG = node_1.buildFileTag('error-handling.ts', node_1.colors.bgMagenta.white);
const log = node_1.nodeLogFactory(TAG);
/****************************************** LOCAL CONFIG ******************************************/
/**
 * Prevent double-assignment of global event handlers
 *
 * Crazy string was selected because I don't want anyone to double-set anything. The Symbol
 * makes it *way* less likely, but I still don't want to mess around with this.
 */
const globalErrorHandlerSym = Symbol.for(`___IF_MY_PROPS_ARE_TRUE_GLOBAL_ERR_HANDLERS_ARE_SET____`);
global[globalErrorHandlerSym] = {};
// Timestamp format for logging
const logTimestampFull = `YYYY/MM/DD : hh:mm:ss`;
/******************************************** HELPERS *********************************************/
/**
 * Get the current date, formatted for display in the stream of Express logs to the CLI.
 *
 * @param {string} timestampFormat - [OPTIONAL] momentJS timestamp format e.g. `MM/DD::hh:mm:ss`
 *                                   See https://momentjs.com/docs/#/parsing/string-format/
 * @return {string} Current date and time, formatted for use in a timestamp
 *
 * @example Return current date + time as default-formatted timestamp:
 *              now(); // => 2017/02/28 : 12:53:57
 *
 * @example Return current date + time as timestamp without day or second:
 *              now(`YYYY/MM hh:mm`); // => 2017/02 12:53
 */
function now(timestampFormat) {
    return moment().format(timestampFormat || logTimestampFull);
}
/***************************************** ERROR HANDLERS *****************************************/
/**
 * Handle error-event-triggering exceptions that escape all other exception handlers.
 * A 'safety net' to ensure all errors get caught at least by something.
 * Causes the triggering Node process to exit following the error message.
 *
 * @param {boolean} quitOnError - If true, stop the node process on error. Defaults to true.
 */
function uncaughtExceptionHandlerSetup(quitOnError = true) {
    const pe = prettyErrorFactory();
    // Prevent uncaught exception handlers from getting set more than once
    if (global[globalErrorHandlerSym].uncaughtExceptionHandler) {
        return pe;
    }
    global[globalErrorHandlerSym].uncaughtExceptionHandler = true;
    process.on('uncaughtException', (err) => {
        console.error(`\n\n${TAG} *** App terminating due to uncaught exception ***`);
        console.error(`${TAG}[${now()}] Uncaught exception: ${err.message}`);
        console.error(err.stack.split(app_root_path_1.path).join('.'));
        console.log(pe.render(err));
        if (quitOnError)
            process.exit(1);
    });
    return pe;
}
;
/**
 * Globally assign various error handling features.
 * Catches both unhandled promise rejections and uncaught exceptions. Activates
 * unlimited stacktraces. Removes node core modules from stacktrace. Returns a
 * helpful error rendering object (PrettyError instance). Converts all errors in
 * the app to display with "pretty errors" rather than the unreadable defaults.
 *
 * @return {PrettyError} A prettified error logging object.
 */
const globalDevErrorHandlingSetup = () => {
    // Set up more usable error logs. Return beautified log rendering function.
    const pe = prettyErrorFactory();
    if (process.env.NODE_ENV !== 'production') {
        // Prevent global dev error handlers from getting set more than once
        if (global[globalErrorHandlerSym].globalDevErrorHandlers) {
            return pe;
        }
        global[globalErrorHandlerSym].globalDevErrorHandlers = true;
        // Allow infinite stacktrace.
        Error.stackTraceLimit = Infinity;
        // Exclude node internal calls from the stack.
        require('clarify');
        catchUnhandledRejectionErrorsSetup(pe);
        uncaughtExceptionHandlerSetup();
        log.info('Error handling setup complete!');
    }
    // Always return the pretty error renderer
    return pe;
};
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
function prettyErrorFactory() {
    const pe = new PrettyError();
    pe.skipNodeFiles();
    pe.skipPackage('bluebird');
    pe.skipPackage('express');
    pe.skipPackage('async');
    pe.skipPackage('lodash');
    pe.start();
    return pe;
}
exports.prettyErrorFactory = prettyErrorFactory;
/**
 * Render unhandled rejections created by promises.
 * Normally these errors get swallowed.
 */
function catchUnhandledRejectionErrorsSetup(pe) {
    process.on('unhandledRejection', function (reason) {
        console.log(``);
        console.log(`  ${_.repeat('*', 40)} UNHANDLED PROMISE REJECTION ${_.repeat('*', 40)}`);
        console.log(pe.render(reason));
        console.log(`  ${_.repeat('*', 109)}`);
        console.trace('unhandled promise rejection, following trail backwards...');
        console.log(``);
    });
    return pe;
}
//
// Merge exports into a useful namespace. Just running the top-level item sets all handlers
// up in Node, but more granularity is available by accessing the individual handler types on
// the function object (top-level item), rather than running it.
//
exports.GlobalNodeErrorHandlersSetup = Object.assign(globalDevErrorHandlingSetup, {
    uncaughtExceptionHandlerSetup,
    catchUnhandledRejectionErrorsSetup
});
//# sourceMappingURL=node-error-handling.js.map