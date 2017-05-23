# errorcatcher

Top-level error handling for NodeJS
===================================
*   Automatically catches missed errors.
*   "Prettifies" all error outputs.
*   Used via a simple 'include' and run (operates via side effects):

    import { GlobalNodeErrorHandlersSetup } from 'errorcatcher';
    GlobalNodeErrorHandlersSetup();
    // All errors thrown in the app will now display as clean "PrettyErrors"

prettyErrorFactory
------------------
*   prettyErrorFactory allows creation of your own PrettyError objects whenever needed.

    import { prettyErrorFactory } from 'errorcatcher';

*   (It probably won't be required)
