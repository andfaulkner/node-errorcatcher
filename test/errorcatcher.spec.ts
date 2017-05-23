/// <reference path="../node_modules/@types/mocha/index.d.ts" />
/// <reference path="../node_modules/@types/node/index.d.ts" />

Error.stackTraceLimit = Infinity;

//
// TODO  ::   Make the testing considerably more robust for GlobalNodeErrorHandlersSetup.
//

// Ensure environment knows testing is occurring.
process.env.mocha = true;

// Store original process.argv.
const oldProcArgs = Object.assign({}, process.argv);

/************************************** THIRD-PARTY IMPORTS ***************************************/
import { expect } from 'chai';
import * as sinon from 'sinon';

import * as fs from 'fs';
import * as path from 'path';

import * as PrettyError from 'pretty-error';
import { blockLogOutput } from 'kidnap-console';

import { buildFileTag, colors, nodeLogFactory } from 'mad-logs/lib/node';
const log = nodeLogFactory(buildFileTag('errorsmith.spec.ts', colors.bgWhite.magenta));
import { StackUtils } from 'mad-utils';

/*********************************** IMPORT FILES TO BE TESTED ************************************/
import { GlobalNodeErrorHandlersSetup, prettyErrorFactory } from '../index';


/******************************************** HELPERS *********************************************/
/**
 * Expect that testValue is an empty object: {}
 */
const expectEmptyNonArrayObject = function(testValue: any) {
    expect(Object.keys(testValue)).to.be.empty;
    expect(testValue).to.be.an('object');
    expect(testValue).to.not.be.arguments;
    expect(testValue).to.not.be.null;
    expect(testValue).to.not.be.undefined;
};

/********************************************* TESTS **********************************************/
describe('errorcatcher ::', function() {
    /**
     * TODO test the global actions.
     */
    describe('GlobalNodeErrorHandlersSetup (as function)', function() {
        it('exists', function() {
            expect(GlobalNodeErrorHandlersSetup).to.exist;
        });

        it('is a function', function() {
            expect(GlobalNodeErrorHandlersSetup).to.be.a('function');
        });

        it('contains sub-functions as properties (for running individually)', function() {
            expect(GlobalNodeErrorHandlersSetup.catchUnhandledRejectionErrorsSetup).to.exist;
            expect(GlobalNodeErrorHandlersSetup.uncaughtExceptionHandlerSetup).to.exist;
            expect(GlobalNodeErrorHandlersSetup.catchUnhandledRejectionErrorsSetup).to.be.a('function');
            expect(GlobalNodeErrorHandlersSetup.uncaughtExceptionHandlerSetup).to.be.a('function');

            log.verbose('2nd stack item: ', StackUtils.getSecondStackItem((new Error).stack));
        });

        it('when run as function: sets global symbol IDing that error handlers active', function() {
            // Get the symbol
            const globalSym = Symbol.for(`___IF_MY_PROPS_ARE_TRUE_GLOBAL_ERR_HANDLERS_ARE_SET____`);
            log.verbose('globalSym:', globalSym);

            const globalVal = global[globalSym];
            log.verbose('global[globalSym]:', globalVal);

            // Ensure PrettyErrors has not yet replaced the regular output.
            // TODO this is repetitive (see below), DRY it up.
            try {
                throw new Error('Crash due to bear attack');
            } catch (err) {
                expect(err.stack).to.not.match(new RegExp('\u001b'));
                expect(err.stack).to.not.match(new RegExp('\u001b\\[0m\u001b\\[37m'));
                expect(err.stack).to.not.match(new RegExp('\u001b\\[0m\n\u001b\\[0m'));
                expect(err.stack).to.not.match(new RegExp(
                    `\u001b\\[0m\u001b\\[93m${
                        path.basename(__filename)
                    }\u001b\\[0m\u001b\\[90m:\u001b\\[0m\u001b\\[93m`
                ));
            }

            // Ensure it starts off empty
            expectEmptyNonArrayObject(globalVal);
            // Run function to attach all global error handlers & set the global symbol's value
            GlobalNodeErrorHandlersSetup();
            // Ensure global symbol now contains the expected values.
            expect(globalVal).to.not.be.empty;
            expect(globalVal).to.contain.keys('globalDevErrorHandlers', 'uncaughtExceptionHandler');

            expect(globalVal['globalDevErrorHandlers']).to.be.true;
            expect(globalVal['uncaughtExceptionHandler']).to.be.true;
        });

        it('when run as function: return value is a PrettyError instance', function() {
            const pe = GlobalNodeErrorHandlersSetup();
            expect(pe).to.be.not.empty;
            expect(pe).to.be.an('object');
            expect(pe).to.be.instanceof(PrettyError);
        });

        it('when run as function: sets app to show PrettyError err output by default', function() {
            // This actually occurred earlier, but just to keep it a little more stateless
            // (which it's not: this uses a singleton) we'll do it again here, so at least
            // re-ordering won't break *this* test (though it will break some of the others).
            GlobalNodeErrorHandlersSetup();

            try {
                throw new Error('Crash due to bear attack');
            } catch (err) {
                log.verbose.inspect('err:', err);
                log.verbose('typeof err:', typeof err);
                log.verbose('err.stack:', err.stack);
                log.verbose('err.name:', err.name);
                log.verbose('err.message:', err.message);
                log.verbose('path.basename(__filename):', path.basename(__filename));

                // Only PrettyError produces an output like this
                // It's because of all the colours it adds.
                expect(err.stack).to.match(new RegExp('\u001b'));
                expect(err.stack).to.match(new RegExp('\u001b\\[0m\u001b\\[37m'));
                expect(err.stack).to.match(new RegExp('\u001b\\[0m\n\u001b\\[0m'));
                expect(err.stack).to.match(new RegExp(
                    `\u001b\\[0m\u001b\\[93m${
                        path.basename(__filename)
                    }\u001b\\[0m\u001b\\[90m:\u001b\\[0m\u001b\\[93m`
                ));
            }
        });
    });

    /**
     * Restore original process.argv.
     */
    after(function() {
        process.argv = Object.assign({}, oldProcArgs);
    });
});
