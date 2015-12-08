/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var v8Protocol_1 = require('./v8Protocol');
var Net = require('net');
var Url = require('url');
var Source = (function () {
    function Source(name, path, id) {
        if (id === void 0) { id = 0; }
        this.name = name;
        this.path = path;
        this.sourceReference = id;
    }
    return Source;
})();
exports.Source = Source;
var Scope = (function () {
    function Scope(name, reference, expensive) {
        if (expensive === void 0) { expensive = false; }
        this.name = name;
        this.variablesReference = reference;
        this.expensive = expensive;
    }
    return Scope;
})();
exports.Scope = Scope;
var StackFrame = (function () {
    function StackFrame(i, nm, src, ln, col) {
        this.id = i;
        this.source = src;
        this.line = ln;
        this.column = col;
        this.name = nm;
    }
    return StackFrame;
})();
exports.StackFrame = StackFrame;
var Thread = (function () {
    function Thread(id, name) {
        this.id = id;
        if (name) {
            this.name = name;
        }
        else {
            this.name = "Thread #" + id;
        }
    }
    return Thread;
})();
exports.Thread = Thread;
var Variable = (function () {
    function Variable(name, value, ref) {
        if (ref === void 0) { ref = 0; }
        this.name = name;
        this.value = value;
        this.variablesReference = ref;
    }
    return Variable;
})();
exports.Variable = Variable;
var Breakpoint = (function () {
    function Breakpoint(verified, line) {
        this.verified = verified;
        this.line = line;
    }
    return Breakpoint;
})();
exports.Breakpoint = Breakpoint;
var StoppedEvent = (function (_super) {
    __extends(StoppedEvent, _super);
    function StoppedEvent(reason, threadId, exception_text) {
        if (exception_text === void 0) { exception_text = null; }
        _super.call(this, 'stopped');
        this.body = {
            reason: reason,
            threadId: threadId
        };
        if (exception_text) {
            this.body.text = exception_text;
        }
    }
    return StoppedEvent;
})(v8Protocol_1.Event);
exports.StoppedEvent = StoppedEvent;
var InitializedEvent = (function (_super) {
    __extends(InitializedEvent, _super);
    function InitializedEvent() {
        _super.call(this, 'initialized');
    }
    return InitializedEvent;
})(v8Protocol_1.Event);
exports.InitializedEvent = InitializedEvent;
var TerminatedEvent = (function (_super) {
    __extends(TerminatedEvent, _super);
    function TerminatedEvent() {
        _super.call(this, 'terminated');
    }
    return TerminatedEvent;
})(v8Protocol_1.Event);
exports.TerminatedEvent = TerminatedEvent;
var OutputEvent = (function (_super) {
    __extends(OutputEvent, _super);
    function OutputEvent(output, category) {
        if (category === void 0) { category = 'console'; }
        _super.call(this, 'output');
        this.body = {
            category: category,
            output: output
        };
    }
    return OutputEvent;
})(v8Protocol_1.Event);
exports.OutputEvent = OutputEvent;
(function (ErrorDestination) {
    ErrorDestination[ErrorDestination["User"] = 1] = "User";
    ErrorDestination[ErrorDestination["Telemetry"] = 2] = "Telemetry";
})(exports.ErrorDestination || (exports.ErrorDestination = {}));
var ErrorDestination = exports.ErrorDestination;
;
var DebugSession = (function (_super) {
    __extends(DebugSession, _super);
    function DebugSession(debuggerLinesAndColumnsStartAt1, isServer) {
        var _this = this;
        if (isServer === void 0) { isServer = false; }
        _super.call(this);
        this._debuggerLinesStartAt1 = debuggerLinesAndColumnsStartAt1;
        this._debuggerColumnsStartAt1 = debuggerLinesAndColumnsStartAt1;
        this._debuggerPathsAreURIs = false;
        this._clientLinesStartAt1 = true;
        this._clientColumnsStartAt1 = true;
        this._clientPathsAreURIs = false;
        this._isServer = isServer;
        this.on('close', function () {
            _this.shutdown();
        });
        this.on('error', function (error) {
            _this.shutdown();
        });
    }
    /**
     * A virtual constructor...
     */
    DebugSession.run = function (debugSession) {
        // parse arguments
        var port = 0;
        var args = process.argv.slice(2);
        args.forEach(function (val, index, array) {
            var portMatch = /^--server=(\d{4,5})$/.exec(val);
            if (portMatch) {
                port = parseInt(portMatch[1], 10);
            }
        });
        if (port > 0) {
            // start as a server
            console.error("waiting for v8 protocol on port " + port);
            Net.createServer(function (socket) {
                console.error('>> accepted connection from client');
                socket.on('end', function () {
                    console.error('>> client connection closed\n');
                });
                new debugSession(false, true).start(socket, socket);
            }).listen(port);
        }
        else {
            // start a session
            console.error("waiting for v8 protocol on stdin/stdout");
            var session = new debugSession(false);
            process.on('SIGTERM', function () {
                session.shutdown();
            });
            session.start(process.stdin, process.stdout);
        }
    };
    DebugSession.prototype.shutdown = function () {
        if (this._isServer) {
            console.error('process.exit ignored in server mode');
        }
        else {
            // wait a bit before shutting down
            setTimeout(function () {
                process.exit(0);
            }, 100);
        }
    };
    DebugSession.prototype.sendErrorResponse = function (response, code, format, args, dest) {
        if (dest === void 0) { dest = ErrorDestination.User; }
        var message = DebugSession.formatPII(format, true, args);
        response.success = false;
        response.message = response.command + ": " + message;
        if (!response.body) {
            response.body = {};
        }
        var msg = {
            id: code,
            format: format
        };
        if (args) {
            msg.variables = args;
        }
        if (dest & ErrorDestination.User) {
            msg.showUser = true;
        }
        if (dest & ErrorDestination.Telemetry) {
            msg.sendTelemetry = true;
        }
        response.body.error = msg;
        this.sendResponse(response);
    };
    DebugSession.prototype.dispatchRequest = function (request) {
        var response = new v8Protocol_1.Response(request);
        try {
            if (request.command === 'initialize') {
                var args = request.arguments;
                if (typeof args.linesStartAt1 === 'boolean') {
                    this._clientLinesStartAt1 = args.linesStartAt1;
                }
                if (typeof args.columnsStartAt1 === 'boolean') {
                    this._clientColumnsStartAt1 = args.columnsStartAt1;
                }
                if (args.pathFormat !== 'path') {
                    this.sendErrorResponse(response, 2018, "debug adapter only supports native paths", null, ErrorDestination.Telemetry);
                }
                else {
                    this.initializeRequest(response, args);
                }
            }
            else if (request.command === 'launch') {
                this.launchRequest(response, request.arguments);
            }
            else if (request.command === 'attach') {
                this.attachRequest(response, request.arguments);
            }
            else if (request.command === 'disconnect') {
                this.disconnectRequest(response, request.arguments);
            }
            else if (request.command === 'setBreakpoints') {
                this.setBreakPointsRequest(response, request.arguments);
            }
            else if (request.command === 'setExceptionBreakpoints') {
                this.setExceptionBreakPointsRequest(response, request.arguments);
            }
            else if (request.command === 'continue') {
                this.continueRequest(response, request.arguments);
            }
            else if (request.command === 'next') {
                this.nextRequest(response, request.arguments);
            }
            else if (request.command === 'stepIn') {
                this.stepInRequest(response, request.arguments);
            }
            else if (request.command === 'stepOut') {
                this.stepOutRequest(response, request.arguments);
            }
            else if (request.command === 'pause') {
                this.pauseRequest(response, request.arguments);
            }
            else if (request.command === 'stackTrace') {
                this.stackTraceRequest(response, request.arguments);
            }
            else if (request.command === 'scopes') {
                this.scopesRequest(response, request.arguments);
            }
            else if (request.command === 'variables') {
                this.variablesRequest(response, request.arguments);
            }
            else if (request.command === 'source') {
                this.sourceRequest(response, request.arguments);
            }
            else if (request.command === 'threads') {
                this.threadsRequest(response);
            }
            else if (request.command === 'evaluate') {
                this.evaluateRequest(response, request.arguments);
            }
            else {
                this.sendErrorResponse(response, 1014, "unrecognized request", null, ErrorDestination.Telemetry);
            }
        }
        catch (e) {
            this.sendErrorResponse(response, 1104, "exception while processing request (exception: {_exception})", { _exception: e.message }, ErrorDestination.Telemetry);
        }
    };
    DebugSession.prototype.initializeRequest = function (response, args) {
        this.sendResponse(response);
    };
    DebugSession.prototype.disconnectRequest = function (response, args) {
        this.sendResponse(response);
        this.shutdown();
    };
    DebugSession.prototype.launchRequest = function (response, args) {
        this.sendResponse(response);
    };
    DebugSession.prototype.attachRequest = function (response, args) {
        this.sendResponse(response);
    };
    DebugSession.prototype.setBreakPointsRequest = function (response, args) {
        this.sendResponse(response);
    };
    DebugSession.prototype.setExceptionBreakPointsRequest = function (response, args) {
        this.sendResponse(response);
    };
    DebugSession.prototype.continueRequest = function (response, args) {
        this.sendResponse(response);
    };
    DebugSession.prototype.nextRequest = function (response, args) {
        this.sendResponse(response);
    };
    DebugSession.prototype.stepInRequest = function (response, args) {
        this.sendResponse(response);
    };
    DebugSession.prototype.stepOutRequest = function (response, args) {
        this.sendResponse(response);
    };
    DebugSession.prototype.pauseRequest = function (response, args) {
        this.sendResponse(response);
    };
    DebugSession.prototype.sourceRequest = function (response, args) {
        this.sendResponse(response);
    };
    DebugSession.prototype.threadsRequest = function (response) {
        this.sendResponse(response);
    };
    DebugSession.prototype.stackTraceRequest = function (response, args) {
        this.sendResponse(response);
    };
    DebugSession.prototype.scopesRequest = function (response, args) {
        this.sendResponse(response);
    };
    DebugSession.prototype.variablesRequest = function (response, args) {
        this.sendResponse(response);
    };
    DebugSession.prototype.evaluateRequest = function (response, args) {
        this.sendResponse(response);
    };
    //---- protected -------------------------------------------------------------------------------------------------
    DebugSession.prototype.convertClientLineToDebugger = function (line) {
        if (this._debuggerLinesStartAt1) {
            return this._clientLinesStartAt1 ? line : line + 1;
        }
        return this._clientLinesStartAt1 ? line - 1 : line;
    };
    DebugSession.prototype.convertDebuggerLineToClient = function (line) {
        if (this._debuggerLinesStartAt1) {
            return this._clientLinesStartAt1 ? line : line - 1;
        }
        return this._clientLinesStartAt1 ? line + 1 : line;
    };
    DebugSession.prototype.convertClientColumnToDebugger = function (column) {
        if (this._debuggerColumnsStartAt1) {
            return this._clientColumnsStartAt1 ? column : column + 1;
        }
        return this._clientColumnsStartAt1 ? column - 1 : column;
    };
    DebugSession.prototype.convertDebuggerColumnToClient = function (column) {
        if (this._debuggerColumnsStartAt1) {
            return this._clientColumnsStartAt1 ? column : column + 1;
        }
        return this._clientColumnsStartAt1 ? column - 1 : column;
    };
    DebugSession.prototype.convertClientPathToDebugger = function (clientPath) {
        if (this._clientPathsAreURIs != this._debuggerPathsAreURIs) {
            if (this._clientPathsAreURIs) {
                return DebugSession.uri2path(clientPath);
            }
            else {
                return DebugSession.path2uri(clientPath);
            }
        }
        return clientPath;
    };
    DebugSession.prototype.convertDebuggerPathToClient = function (debuggerPath) {
        if (this._debuggerPathsAreURIs != this._clientPathsAreURIs) {
            if (this._debuggerPathsAreURIs) {
                return DebugSession.uri2path(debuggerPath);
            }
            else {
                return DebugSession.path2uri(debuggerPath);
            }
        }
        return debuggerPath;
    };
    //---- private -------------------------------------------------------------------------------
    DebugSession.path2uri = function (str) {
        var pathName = str.replace(/\\/g, '/');
        if (pathName[0] !== '/') {
            pathName = '/' + pathName;
        }
        return encodeURI('file://' + pathName);
    };
    DebugSession.uri2path = function (url) {
        return Url.parse(url).pathname;
    };
    /*
    * If argument starts with '_' it is OK to send its value to telemetry.
    */
    DebugSession.formatPII = function (format, excludePII, args) {
        return format.replace(DebugSession._formatPIIRegexp, function (match, paramName) {
            if (excludePII && paramName.length > 0 && paramName[0] !== '_') {
                return match;
            }
            return args[paramName] && args.hasOwnProperty(paramName) ?
                args[paramName] :
                match;
        });
    };
    DebugSession._formatPIIRegexp = /{([^}]+)}/g;
    return DebugSession;
})(v8Protocol_1.V8Protocol);
exports.DebugSession = DebugSession;
//# sourceMappingURL=debugSession.js.map