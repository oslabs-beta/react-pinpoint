import 'path';

function createCommonjsModule(fn, basedir, module) {
  return (
    (module = {
      path: basedir,
      exports: {},
      require: function (path, base) {
        return commonjsRequire(path, base === undefined || base === null ? module.path : base);
      },
    }),
    fn(module, module.exports),
    module.exports
  );
}

function commonjsRequire() {
  throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
}

var runtime_1 = createCommonjsModule(function (module) {
  /**
   * Copyright (c) 2014-present, Facebook, Inc.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   */

  var runtime = (function (exports) {
    var Op = Object.prototype;
    var hasOwn = Op.hasOwnProperty;
    var undefined$1; // More compressible than void 0.
    var $Symbol = typeof Symbol === 'function' ? Symbol : {};
    var iteratorSymbol = $Symbol.iterator || '@@iterator';
    var asyncIteratorSymbol = $Symbol.asyncIterator || '@@asyncIterator';
    var toStringTagSymbol = $Symbol.toStringTag || '@@toStringTag';

    function define(obj, key, value) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true,
      });
      return obj[key];
    }
    try {
      // IE 8 has a broken Object.defineProperty that only works on DOM objects.
      define({}, '');
    } catch (err) {
      define = function (obj, key, value) {
        return (obj[key] = value);
      };
    }

    function wrap(innerFn, outerFn, self, tryLocsList) {
      // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
      var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
      var generator = Object.create(protoGenerator.prototype);
      var context = new Context(tryLocsList || []);

      // The ._invoke method unifies the implementations of the .next,
      // .throw, and .return methods.
      generator._invoke = makeInvokeMethod(innerFn, self, context);

      return generator;
    }
    exports.wrap = wrap;

    // Try/catch helper to minimize deoptimizations. Returns a completion
    // record like context.tryEntries[i].completion. This interface could
    // have been (and was previously) designed to take a closure to be
    // invoked without arguments, but in all the cases we care about we
    // already have an existing method we want to call, so there's no need
    // to create a new function object. We can even get away with assuming
    // the method takes exactly one argument, since that happens to be true
    // in every case, so we don't have to touch the arguments object. The
    // only additional allocation required is the completion record, which
    // has a stable shape and so hopefully should be cheap to allocate.
    function tryCatch(fn, obj, arg) {
      try {
        return {type: 'normal', arg: fn.call(obj, arg)};
      } catch (err) {
        return {type: 'throw', arg: err};
      }
    }

    var GenStateSuspendedStart = 'suspendedStart';
    var GenStateSuspendedYield = 'suspendedYield';
    var GenStateExecuting = 'executing';
    var GenStateCompleted = 'completed';

    // Returning this object from the innerFn has the same effect as
    // breaking out of the dispatch switch statement.
    var ContinueSentinel = {};

    // Dummy constructor functions that we use as the .constructor and
    // .constructor.prototype properties for functions that return Generator
    // objects. For full spec compliance, you may wish to configure your
    // minifier not to mangle the names of these two functions.
    function Generator() {}
    function GeneratorFunction() {}
    function GeneratorFunctionPrototype() {}

    // This is a polyfill for %IteratorPrototype% for environments that
    // don't natively support it.
    var IteratorPrototype = {};
    IteratorPrototype[iteratorSymbol] = function () {
      return this;
    };

    var getProto = Object.getPrototypeOf;
    var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
    if (NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
      // This environment has a native %IteratorPrototype%; use it instead
      // of the polyfill.
      IteratorPrototype = NativeIteratorPrototype;
    }

    var Gp = (GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype));
    GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
    GeneratorFunctionPrototype.constructor = GeneratorFunction;
    GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, 'GeneratorFunction');

    // Helper for defining the .next, .throw, and .return methods of the
    // Iterator interface in terms of a single ._invoke method.
    function defineIteratorMethods(prototype) {
      ['next', 'throw', 'return'].forEach(function (method) {
        define(prototype, method, function (arg) {
          return this._invoke(method, arg);
        });
      });
    }

    exports.isGeneratorFunction = function (genFun) {
      var ctor = typeof genFun === 'function' && genFun.constructor;
      return ctor
        ? ctor === GeneratorFunction ||
            // For the native GeneratorFunction constructor, the best we can
            // do is to check its .name property.
            (ctor.displayName || ctor.name) === 'GeneratorFunction'
        : false;
    };

    exports.mark = function (genFun) {
      if (Object.setPrototypeOf) {
        Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
      } else {
        genFun.__proto__ = GeneratorFunctionPrototype;
        define(genFun, toStringTagSymbol, 'GeneratorFunction');
      }
      genFun.prototype = Object.create(Gp);
      return genFun;
    };

    // Within the body of any async function, `await x` is transformed to
    // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
    // `hasOwn.call(value, "__await")` to determine if the yielded value is
    // meant to be awaited.
    exports.awrap = function (arg) {
      return {__await: arg};
    };

    function AsyncIterator(generator, PromiseImpl) {
      function invoke(method, arg, resolve, reject) {
        var record = tryCatch(generator[method], generator, arg);
        if (record.type === 'throw') {
          reject(record.arg);
        } else {
          var result = record.arg;
          var value = result.value;
          if (value && typeof value === 'object' && hasOwn.call(value, '__await')) {
            return PromiseImpl.resolve(value.__await).then(
              function (value) {
                invoke('next', value, resolve, reject);
              },
              function (err) {
                invoke('throw', err, resolve, reject);
              },
            );
          }

          return PromiseImpl.resolve(value).then(
            function (unwrapped) {
              // When a yielded Promise is resolved, its final value becomes
              // the .value of the Promise<{value,done}> result for the
              // current iteration.
              result.value = unwrapped;
              resolve(result);
            },
            function (error) {
              // If a rejected Promise was yielded, throw the rejection back
              // into the async generator function so it can be handled there.
              return invoke('throw', error, resolve, reject);
            },
          );
        }
      }

      var previousPromise;

      function enqueue(method, arg) {
        function callInvokeWithMethodAndArg() {
          return new PromiseImpl(function (resolve, reject) {
            invoke(method, arg, resolve, reject);
          });
        }

        return (previousPromise =
          // If enqueue has been called before, then we want to wait until
          // all previous Promises have been resolved before calling invoke,
          // so that results are always delivered in the correct order. If
          // enqueue has not been called before, then it is important to
          // call invoke immediately, without waiting on a callback to fire,
          // so that the async generator function has the opportunity to do
          // any necessary setup in a predictable way. This predictability
          // is why the Promise constructor synchronously invokes its
          // executor callback, and why async functions synchronously
          // execute code before the first await. Since we implement simple
          // async functions in terms of async generators, it is especially
          // important to get this right, even though it requires care.
          previousPromise
            ? previousPromise.then(
                callInvokeWithMethodAndArg,
                // Avoid propagating failures to Promises returned by later
                // invocations of the iterator.
                callInvokeWithMethodAndArg,
              )
            : callInvokeWithMethodAndArg());
      }

      // Define the unified helper method that is used to implement .next,
      // .throw, and .return (see defineIteratorMethods).
      this._invoke = enqueue;
    }

    defineIteratorMethods(AsyncIterator.prototype);
    AsyncIterator.prototype[asyncIteratorSymbol] = function () {
      return this;
    };
    exports.AsyncIterator = AsyncIterator;

    // Note that simple async functions are implemented on top of
    // AsyncIterator objects; they just return a Promise for the value of
    // the final result produced by the iterator.
    exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) {
      if (PromiseImpl === void 0) PromiseImpl = Promise;

      var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl);

      return exports.isGeneratorFunction(outerFn)
        ? iter // If outerFn is a generator, return the full iterator.
        : iter.next().then(function (result) {
            return result.done ? result.value : iter.next();
          });
    };

    function makeInvokeMethod(innerFn, self, context) {
      var state = GenStateSuspendedStart;

      return function invoke(method, arg) {
        if (state === GenStateExecuting) {
          throw new Error('Generator is already running');
        }

        if (state === GenStateCompleted) {
          if (method === 'throw') {
            throw arg;
          }

          // Be forgiving, per 25.3.3.3.3 of the spec:
          // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
          return doneResult();
        }

        context.method = method;
        context.arg = arg;

        while (true) {
          var delegate = context.delegate;
          if (delegate) {
            var delegateResult = maybeInvokeDelegate(delegate, context);
            if (delegateResult) {
              if (delegateResult === ContinueSentinel) continue;
              return delegateResult;
            }
          }

          if (context.method === 'next') {
            // Setting context._sent for legacy support of Babel's
            // function.sent implementation.
            context.sent = context._sent = context.arg;
          } else if (context.method === 'throw') {
            if (state === GenStateSuspendedStart) {
              state = GenStateCompleted;
              throw context.arg;
            }

            context.dispatchException(context.arg);
          } else if (context.method === 'return') {
            context.abrupt('return', context.arg);
          }

          state = GenStateExecuting;

          var record = tryCatch(innerFn, self, context);
          if (record.type === 'normal') {
            // If an exception is thrown from innerFn, we leave state ===
            // GenStateExecuting and loop back for another invocation.
            state = context.done ? GenStateCompleted : GenStateSuspendedYield;

            if (record.arg === ContinueSentinel) {
              continue;
            }

            return {
              value: record.arg,
              done: context.done,
            };
          } else if (record.type === 'throw') {
            state = GenStateCompleted;
            // Dispatch the exception by looping back around to the
            // context.dispatchException(context.arg) call above.
            context.method = 'throw';
            context.arg = record.arg;
          }
        }
      };
    }

    // Call delegate.iterator[context.method](context.arg) and handle the
    // result, either by returning a { value, done } result from the
    // delegate iterator, or by modifying context.method and context.arg,
    // setting context.delegate to null, and returning the ContinueSentinel.
    function maybeInvokeDelegate(delegate, context) {
      var method = delegate.iterator[context.method];
      if (method === undefined$1) {
        // A .throw or .return when the delegate iterator has no .throw
        // method always terminates the yield* loop.
        context.delegate = null;

        if (context.method === 'throw') {
          // Note: ["return"] must be used for ES3 parsing compatibility.
          if (delegate.iterator['return']) {
            // If the delegate iterator has a return method, give it a
            // chance to clean up.
            context.method = 'return';
            context.arg = undefined$1;
            maybeInvokeDelegate(delegate, context);

            if (context.method === 'throw') {
              // If maybeInvokeDelegate(context) changed context.method from
              // "return" to "throw", let that override the TypeError below.
              return ContinueSentinel;
            }
          }

          context.method = 'throw';
          context.arg = new TypeError("The iterator does not provide a 'throw' method");
        }

        return ContinueSentinel;
      }

      var record = tryCatch(method, delegate.iterator, context.arg);

      if (record.type === 'throw') {
        context.method = 'throw';
        context.arg = record.arg;
        context.delegate = null;
        return ContinueSentinel;
      }

      var info = record.arg;

      if (!info) {
        context.method = 'throw';
        context.arg = new TypeError('iterator result is not an object');
        context.delegate = null;
        return ContinueSentinel;
      }

      if (info.done) {
        // Assign the result of the finished delegate to the temporary
        // variable specified by delegate.resultName (see delegateYield).
        context[delegate.resultName] = info.value;

        // Resume execution at the desired location (see delegateYield).
        context.next = delegate.nextLoc;

        // If context.method was "throw" but the delegate handled the
        // exception, let the outer generator proceed normally. If
        // context.method was "next", forget context.arg since it has been
        // "consumed" by the delegate iterator. If context.method was
        // "return", allow the original .return call to continue in the
        // outer generator.
        if (context.method !== 'return') {
          context.method = 'next';
          context.arg = undefined$1;
        }
      } else {
        // Re-yield the result returned by the delegate method.
        return info;
      }

      // The delegate iterator is finished, so forget it and continue with
      // the outer generator.
      context.delegate = null;
      return ContinueSentinel;
    }

    // Define Generator.prototype.{next,throw,return} in terms of the
    // unified ._invoke helper method.
    defineIteratorMethods(Gp);

    define(Gp, toStringTagSymbol, 'Generator');

    // A Generator should always return itself as the iterator object when the
    // @@iterator function is called on it. Some browsers' implementations of the
    // iterator prototype chain incorrectly implement this, causing the Generator
    // object to not be returned from this call. This ensures that doesn't happen.
    // See https://github.com/facebook/regenerator/issues/274 for more details.
    Gp[iteratorSymbol] = function () {
      return this;
    };

    Gp.toString = function () {
      return '[object Generator]';
    };

    function pushTryEntry(locs) {
      var entry = {tryLoc: locs[0]};

      if (1 in locs) {
        entry.catchLoc = locs[1];
      }

      if (2 in locs) {
        entry.finallyLoc = locs[2];
        entry.afterLoc = locs[3];
      }

      this.tryEntries.push(entry);
    }

    function resetTryEntry(entry) {
      var record = entry.completion || {};
      record.type = 'normal';
      delete record.arg;
      entry.completion = record;
    }

    function Context(tryLocsList) {
      // The root entry object (effectively a try statement without a catch
      // or a finally block) gives us a place to store values thrown from
      // locations where there is no enclosing try statement.
      this.tryEntries = [{tryLoc: 'root'}];
      tryLocsList.forEach(pushTryEntry, this);
      this.reset(true);
    }

    exports.keys = function (object) {
      var keys = [];
      for (var key in object) {
        keys.push(key);
      }
      keys.reverse();

      // Rather than returning an object with a next method, we keep
      // things simple and return the next function itself.
      return function next() {
        while (keys.length) {
          var key = keys.pop();
          if (key in object) {
            next.value = key;
            next.done = false;
            return next;
          }
        }

        // To avoid creating an additional object, we just hang the .value
        // and .done properties off the next function object itself. This
        // also ensures that the minifier will not anonymize the function.
        next.done = true;
        return next;
      };
    };

    function values(iterable) {
      if (iterable) {
        var iteratorMethod = iterable[iteratorSymbol];
        if (iteratorMethod) {
          return iteratorMethod.call(iterable);
        }

        if (typeof iterable.next === 'function') {
          return iterable;
        }

        if (!isNaN(iterable.length)) {
          var i = -1,
            next = function next() {
              while (++i < iterable.length) {
                if (hasOwn.call(iterable, i)) {
                  next.value = iterable[i];
                  next.done = false;
                  return next;
                }
              }

              next.value = undefined$1;
              next.done = true;

              return next;
            };

          return (next.next = next);
        }
      }

      // Return an iterator with no values.
      return {next: doneResult};
    }
    exports.values = values;

    function doneResult() {
      return {value: undefined$1, done: true};
    }

    Context.prototype = {
      constructor: Context,

      reset: function (skipTempReset) {
        this.prev = 0;
        this.next = 0;
        // Resetting context._sent for legacy support of Babel's
        // function.sent implementation.
        this.sent = this._sent = undefined$1;
        this.done = false;
        this.delegate = null;

        this.method = 'next';
        this.arg = undefined$1;

        this.tryEntries.forEach(resetTryEntry);

        if (!skipTempReset) {
          for (var name in this) {
            // Not sure about the optimal order of these conditions:
            if (name.charAt(0) === 't' && hasOwn.call(this, name) && !isNaN(+name.slice(1))) {
              this[name] = undefined$1;
            }
          }
        }
      },

      stop: function () {
        this.done = true;

        var rootEntry = this.tryEntries[0];
        var rootRecord = rootEntry.completion;
        if (rootRecord.type === 'throw') {
          throw rootRecord.arg;
        }

        return this.rval;
      },

      dispatchException: function (exception) {
        if (this.done) {
          throw exception;
        }

        var context = this;
        function handle(loc, caught) {
          record.type = 'throw';
          record.arg = exception;
          context.next = loc;

          if (caught) {
            // If the dispatched exception was caught by a catch block,
            // then let that catch block handle the exception normally.
            context.method = 'next';
            context.arg = undefined$1;
          }

          return !!caught;
        }

        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];
          var record = entry.completion;

          if (entry.tryLoc === 'root') {
            // Exception thrown outside of any try block that could handle
            // it, so set the completion value of the entire function to
            // throw the exception.
            return handle('end');
          }

          if (entry.tryLoc <= this.prev) {
            var hasCatch = hasOwn.call(entry, 'catchLoc');
            var hasFinally = hasOwn.call(entry, 'finallyLoc');

            if (hasCatch && hasFinally) {
              if (this.prev < entry.catchLoc) {
                return handle(entry.catchLoc, true);
              } else if (this.prev < entry.finallyLoc) {
                return handle(entry.finallyLoc);
              }
            } else if (hasCatch) {
              if (this.prev < entry.catchLoc) {
                return handle(entry.catchLoc, true);
              }
            } else if (hasFinally) {
              if (this.prev < entry.finallyLoc) {
                return handle(entry.finallyLoc);
              }
            } else {
              throw new Error('try statement without catch or finally');
            }
          }
        }
      },

      abrupt: function (type, arg) {
        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];
          if (entry.tryLoc <= this.prev && hasOwn.call(entry, 'finallyLoc') && this.prev < entry.finallyLoc) {
            var finallyEntry = entry;
            break;
          }
        }

        if (finallyEntry && (type === 'break' || type === 'continue') && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc) {
          // Ignore the finally entry if control is not jumping to a
          // location outside the try/catch block.
          finallyEntry = null;
        }

        var record = finallyEntry ? finallyEntry.completion : {};
        record.type = type;
        record.arg = arg;

        if (finallyEntry) {
          this.method = 'next';
          this.next = finallyEntry.finallyLoc;
          return ContinueSentinel;
        }

        return this.complete(record);
      },

      complete: function (record, afterLoc) {
        if (record.type === 'throw') {
          throw record.arg;
        }

        if (record.type === 'break' || record.type === 'continue') {
          this.next = record.arg;
        } else if (record.type === 'return') {
          this.rval = this.arg = record.arg;
          this.method = 'return';
          this.next = 'end';
        } else if (record.type === 'normal' && afterLoc) {
          this.next = afterLoc;
        }

        return ContinueSentinel;
      },

      finish: function (finallyLoc) {
        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];
          if (entry.finallyLoc === finallyLoc) {
            this.complete(entry.completion, entry.afterLoc);
            resetTryEntry(entry);
            return ContinueSentinel;
          }
        }
      },

      catch: function (tryLoc) {
        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];
          if (entry.tryLoc === tryLoc) {
            var record = entry.completion;
            if (record.type === 'throw') {
              var thrown = record.arg;
              resetTryEntry(entry);
            }
            return thrown;
          }
        }

        // The context.catch method must only be called with a location
        // argument that corresponds to a known catch block.
        throw new Error('illegal catch attempt');
      },

      delegateYield: function (iterable, resultName, nextLoc) {
        this.delegate = {
          iterator: values(iterable),
          resultName: resultName,
          nextLoc: nextLoc,
        };

        if (this.method === 'next') {
          // Deliberately forget the last sent value so that we don't
          // accidentally pass it on to the delegate.
          this.arg = undefined$1;
        }

        return ContinueSentinel;
      },
    };

    // Regardless of whether this script is executing as a CommonJS module
    // or not, return the runtime object so that we can declare the variable
    // regeneratorRuntime in the outer scope, which allows this module to be
    // injected easily by `bin/regenerator --include-runtime script.js`.
    return exports;
  })(
    // If this script is executing as a CommonJS module, use module.exports
    // as the regeneratorRuntime namespace. Otherwise create a new empty
    // object. Either way, the resulting object will be used to initialize
    // the regeneratorRuntime variable at the top of this file.
    module.exports,
  );

  try {
    regeneratorRuntime = runtime;
  } catch (accidentalStrictMode) {
    // This module should not be running in strict mode, so the above
    // assignment should always work unless something is misconfigured. Just
    // in case runtime.js accidentally runs in strict mode, we can escape
    // strict mode using a global Function call. This could conceivably fail
    // if a Content Security Policy forbids using Function, but in that case
    // the proper solution is to fix the accidental strict mode problem. If
    // you've misconfigured your bundler to force strict mode and applied a
    // CSP to forbid Function, and you're not willing to fix either of those
    // problems, please detail your unique predicament in a GitHub issue.
    Function('r', 'regeneratorRuntime = r')(runtime);
  }
});

var regenerator = runtime_1;

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }

  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  return function () {
    var self = this,
      args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);

      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, 'next', value);
      }

      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, 'throw', err);
      }

      _next(undefined);
    });
  };
}

var asyncToGenerator = _asyncToGenerator;

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true,
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

var defineProperty = _defineProperty;

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError('Cannot call a class as a function');
  }
}

var classCallCheck = _classCallCheck;

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ('value' in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

var createClass = _createClass;

var _typeof_1 = createCommonjsModule(function (module) {
  function _typeof(obj) {
    '@babel/helpers - typeof';

    if (typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol') {
      module.exports = _typeof = function _typeof(obj) {
        return typeof obj;
      };
    } else {
      module.exports = _typeof = function _typeof(obj) {
        return obj && typeof Symbol === 'function' && obj.constructor === Symbol && obj !== Symbol.prototype ? 'symbol' : typeof obj;
      };
    }

    return _typeof(obj);
  }

  module.exports = _typeof;
});

function _createForOfIteratorHelper(o, allowArrayLike) {
  var it;
  if (typeof Symbol === 'undefined' || o[Symbol.iterator] == null) {
    if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || (allowArrayLike && o && typeof o.length === 'number')) {
      if (it) o = it;
      var i = 0;
      var F = function F() {};
      return {
        s: F,
        n: function n() {
          if (i >= o.length) return {done: true};
          return {done: false, value: o[i++]};
        },
        e: function e(_e) {
          throw _e;
        },
        f: F,
      };
    }
    throw new TypeError(
      'Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.',
    );
  }
  var normalCompletion = true,
    didErr = false,
    err;
  return {
    s: function s() {
      it = o[Symbol.iterator]();
    },
    n: function n() {
      var step = it.next();
      normalCompletion = step.done;
      return step;
    },
    e: function e(_e2) {
      didErr = true;
      err = _e2;
    },
    f: function f() {
      try {
        if (!normalCompletion && it['return'] != null) it['return']();
      } finally {
        if (didErr) throw err;
      }
    },
  };
}

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === 'string') return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === 'Object' && o.constructor) n = o.constructor.name;
  if (n === 'Map' || n === 'Set') return Array.from(o);
  if (n === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;
  for (var i = 0, arr2 = new Array(len); i < len; i++) {
    arr2[i] = arr[i];
  }
  return arr2;
}

/* eslint-disable no-prototype-builtins */

/* eslint-disable no-case-declarations */
var TreeNode = /*#__PURE__*/ (function () {
  // will add type after ;D
  function TreeNode(fiberNode, uID) {
    classCallCheck(this, TreeNode);

    this.uID = uID;
    var elementType = fiberNode.elementType,
      selfBaseDuration = fiberNode.selfBaseDuration,
      memoizedState = fiberNode.memoizedState,
      memoizedProps = fiberNode.memoizedProps,
      effectTag = fiberNode.effectTag,
      tag = fiberNode.tag,
      ref = fiberNode.ref,
      updateQueue = fiberNode.updateQueue,
      stateNode = fiberNode.stateNode,
      type = fiberNode.type;
    this.elementType = elementType;
    this.selfBaseDuration = selfBaseDuration;
    this.memoizedProps = memoizedProps;
    this.memoizedState = memoizedState;
    this.effectTag = effectTag;
    this.ref = ref;
    this.type = type;
    this.fiberName = getElementName(fiberNode);
    this.updateQueue = updateQueue; // seems to be replaced entirely and since it exists directly under a fiber node, it can't be modified.

    this.tag = tag;
    this.updateList = [];
    this.children = [];
    this.parent = null;
    this.stateNode = stateNode;

    if (tag === 0 && !stateNode && memoizedState) {
      // pass in "queue" obj to spy on dispatch func
      console.log('attaching a spy', memoizedState.queue);
    }
  }

  createClass(TreeNode, [
    {
      key: 'addChild',
      value: function addChild(treeNode) {
        // remove other uneccessary properties
        this.child = treeNode;
      },
    },
    {
      key: 'addSibling',
      value: function addSibling(treeNode) {
        // if (!node) return;
        this.sibling = treeNode;
      },
    },
    {
      key: 'addParent',
      value: function addParent(treeNode) {
        // if (!node) return;
        this.parent = treeNode;
      },
    },
    {
      key: 'toSerializable',
      value: function toSerializable() {
        var newObj = {};
        var omitList = [
          'memoizedProps', // currently working on serialization for this
          'memoizedState', // and this as well
          'updateList',
          'updateQueue',
          'ref',
          'elementType',
          'stateNode', // serialization needed for this?
          'sibling', // maybe not needed
          'type', // some circular references in here that we haven't accounted for
        ]; // transform each nested node to just ids where appropriate

        var _iterator = _createForOfIteratorHelper(Object.getOwnPropertyNames(this)),
          _step;

        try {
          for (_iterator.s(); !(_step = _iterator.n()).done; ) {
            var key = _step.value;

            if (omitList.indexOf(key) < 0) {
              switch (key) {
                case 'parent':
                  newObj['parent_component_id'] = this[key] ? this[key].uID : this[key];
                  break;

                case 'fiberName':
                  newObj['component_name'] = this[key];
                  break;

                case 'sibling':
                  newObj['sibling_component_id'] = this[key].uID;
                  break;

                case 'selfBaseDuration':
                  newObj['self_base_duration'] = this[key];
                  break;

                case 'child':
                  // probably not needed anymore, this prop seems to be redundant
                  // newObj[`${key}ID`] = this[key].uID;
                  break;

                case 'children':
                  newObj['children_ids'] = this[key].map(function (treeNode) {
                    return treeNode.uID;
                  });
                  break;

                case 'memoizedState':
                  newObj['component_state'] = this[key];
                  break;

                case 'memoizedProps':
                  if (this[key]) {
                    newObj['component_props'] = this[key].hasOwnProperty('children') ? serializeMemoizedProps(this[key]) : this[key];
                  } else {
                    newObj['component_props'] = this[key];
                  } // newObj["component_props"] = this[key];

                  break;

                case 'uID':
                  newObj['component_id'] = this[key];
                  break;

                case 'stateNode':
                  var value = null;

                  if (this[key]) {
                    if (this[key].tag === 5) {
                      value = 'host component';
                    } else if (this[key].tag === 3) {
                      value = 'host root';
                    } else {
                      value = 'other type';
                    }
                  }

                  newObj['state_node'] = value;
                  break;

                default:
                  newObj[key] = this[key];
              }
            }
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }

        return newObj;
      },
    },
  ]);

  return TreeNode;
})();

function getElementName(fiber) {
  var name = '';

  switch (fiber.tag) {
    case 0:
    case 1:
      name = fiber.elementType.name || fiber.type.name; // somehow react lazy has a tag of 1, it seems to be grouped with the

      return name;

    case 3:
      name = 'Host Root';
      return name;

    case 5:
      name = fiber.elementType;

      if (fiber.elementType.className) {
        name += '.'.concat(fiber.elementType.className);
      } else if (fiber.memoizedProps) {
        if (fiber.memoizedProps.className) {
          name += '.'.concat(fiber.memoizedProps.className);
        } else if (fiber.memoizedProps.id) {
          name += '.'.concat(fiber.memoizedProps.id);
        }
      }

      if (name.length > 10) {
        // truncate long name
        name = name.slice(0, 10);
        name += '...';
      }

      return name;

    case 6:
      var textValue = fiber.stateNode.nodeValue; // just to help truncating long text value, exceeding 4 chars will get truncated.

      if (textValue.length > 10) {
        textValue = textValue.slice(0, 10);
        textValue = textValue.padEnd(3, '.');
      }

      name = 'text: '.concat(textValue);
      return name;

    case 8:
      name = 'Strict Mode Zone';
      return name;

    case 9:
      name = fiber.elementType._context.displayName;
      return name;

    case 10:
      name = 'Context'; //

      return name;

    case 11:
      name = fiber.elementType.displayName + '-' + 'to:"'.concat(fiber.memoizedProps.to, '"');
      return name;

    case 13:
      name = 'Suspense Zone';
      return name;

    case 16:
      name = 'Lazy - ' + fiber.elementType._result.name;
      return name;

    default:
      return ''.concat(typeof fiber.elementType !== 'string' ? fiber.elementType : 'unknown');
  }
}

function serializeMemoizedProps(obj) {
  if (!obj) return null; // list of props to omit from the resulting object in return statement

  var omitList = ['props', '_owner', '_store', '_sef', '_source', '_self'];
  var newObj = null; // loop through each prop to check if they exist on omitList
  // if yes then skip, no then include in the object being returned;

  if (Array.isArray(obj)) {
    if (!newObj) newObj = [];

    for (var i = 0; i < obj.length; i++) {
      var nestedChild = {};

      var _iterator2 = _createForOfIteratorHelper(Object.getOwnPropertyNames(obj[i])),
        _step2;

      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done; ) {
          var key = _step2.value;

          if (omitList.indexOf(key) < 0) {
            nestedChild[key] = obj[i][key];
          }
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }

      newObj.push(nestedChild);
    }
  } else {
    var _iterator3 = _createForOfIteratorHelper(Object.getOwnPropertyNames(obj)),
      _step3;

    try {
      for (_iterator3.s(); !(_step3 = _iterator3.n()).done; ) {
        var _key2 = _step3.value;

        if (omitList.indexOf(_key2) < 0) {
          if (!newObj) newObj = {};

          if (_typeof_1(obj[_key2]) === 'object') {
            newObj[_key2] = serializeMemoizedProps(obj[_key2]);
          } else if (_typeof_1(obj[_key2]) === 'symbol') {
            newObj[_key2] = obj[_key2].toString();
          } else {
            newObj[_key2] = obj[_key2];
          }
        }
      }
    } catch (err) {
      _iterator3.e(err);
    } finally {
      _iterator3.f();
    }
  }

  return newObj;
}

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);
  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly)
      symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
    keys.push.apply(keys, symbols);
  }
  return keys;
}

function _objectSpread(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};
    if (i % 2) {
      ownKeys(Object(source), true).forEach(function (key) {
        defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(Object(source)).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }
  return target;
}
var fiberMap = undefined;
var processedFibers = undefined;

var Tree = /*#__PURE__*/ (function () {
  // stretch feature
  // a singleton reference
  // a singleton reference
  // uniqueId is used to identify a fiber to then help with counting re-renders
  // componentList
  function Tree(rootNode, FiberMap, ProcessedFibers) {
    classCallCheck(this, Tree);

    fiberMap = FiberMap;
    processedFibers = ProcessedFibers;
    this.uniqueId = fiberMap.size;
    this.componentList = [];
    this.effectList = [];
    this.root = null;
    this.processNode(rootNode, null);
  }

  createClass(Tree, [
    {
      key: 'processNode',
      value: function processNode(fiberNode, previousTreeNode) {
        // id used to reference a fiber in fiberMap
        var id = undefined; // using a unique part of each fiber to identify it.
        // both current and alternate only 1 reference to this unique part
        // which we can use to uniquely identify a fiber node even in the case
        // of current and alternate switching per commit/

        var uniquePart = undefined; // skipping special nodes like svg, path

        if (fiberNode.tag === 5) {
          if (fiberNode.elementType === 'svg' || fiberNode.elementType === 'path') return;
        } // unique part of a fiber node depends on its type.

        if (fiberNode.tag === 0 || fiberNode.tag === 9) {
          uniquePart = fiberNode.memoizedProps;
        } else if (fiberNode.tag === 10 || fiberNode.tag === 11 || fiberNode.tag === 9 || fiberNode.tag === 15 || fiberNode.tag === 16) {
          uniquePart = fiberNode.elementType;
        } else if (fiberNode.tag === 3) {
          uniquePart = fiberNode.stateNode;
        } else if (fiberNode.tag === 7) {
          uniquePart = fiberNode;
        } else if (fiberNode.tag === 8) {
          uniquePart = fiberNode.memoizedProps;
        } else {
          uniquePart = fiberNode.stateNode;
        } // if this is a unique fiber (that both "current" and "alternate" fiber represents)
        // then add to the processedFiber to make sure we don't re-account this fiber.

        if (!processedFibers.has(uniquePart)) {
          id = this.uniqueId;
          this.uniqueId++;
          fiberMap.set(id, fiberNode);
          processedFibers.set(uniquePart, id);
        } else {
          id = processedFibers.get(uniquePart);
        } // If it's a HostRoot with a tag of 3
        // create a new TreeNode

        if (fiberNode.tag === 3 && !this.root) {
          this.root = new TreeNode(fiberNode, id);
          this.componentList.push(this.root); // push a copy

          if (fiberNode.child) {
            this.processNode(fiberNode.child, this.root);
          }
        } else {
          var newNode = new TreeNode(fiberNode, id);
          newNode.addParent(previousTreeNode);
          previousTreeNode.children.push(newNode);
          previousTreeNode.addChild(newNode);
          this.componentList.push(newNode);

          if (fiberNode.child) {
            this.processNode(fiberNode.child, newNode);
          }

          if (fiberNode.sibling) {
            this.processSiblingNode(fiberNode.sibling, newNode, previousTreeNode);
          }
        }
      },
    },
    {
      key: 'processSiblingNode',
      value: function processSiblingNode(fiberNode, previousTreeNode, parentTreeNode) {
        var uniquePart = undefined;
        var id = undefined;

        if (fiberNode.tag === 0 || fiberNode.tag === 9) {
          uniquePart = fiberNode.memoizedProps;
        } else if (fiberNode.tag === 10 || fiberNode.tag === 11 || fiberNode.tag === 9 || fiberNode.tag === 15 || fiberNode.tag === 16) {
          uniquePart = fiberNode.elementType;
        } else if (fiberNode.tag === 3) {
          uniquePart = fiberNode.stateNode;
        } else if (fiberNode.tag === 7) {
          uniquePart = fiberNode;
        } else if (fiberNode.tag === 8) {
          uniquePart = fiberNode.memoizedProps;
        } else {
          uniquePart = fiberNode.stateNode;
        }

        if (!processedFibers.has(uniquePart)) {
          id = this.uniqueId;
          this.uniqueId++;
          fiberMap.set(id, fiberNode);
          processedFibers.set(uniquePart, id);
        } else {
          id = processedFibers.get(uniquePart);
        }

        var newNode = new TreeNode(fiberNode, id);
        newNode.addParent(parentTreeNode);
        parentTreeNode.children.push(newNode);
        previousTreeNode.addSibling(newNode);
        this.componentList.push(newNode);

        if (fiberNode.child) {
          this.processNode(fiberNode.child, newNode);
        }

        if (fiberNode.sibling) {
          this.processSiblingNode(fiberNode.sibling, newNode, parentTreeNode);
        }
      },
    },
    {
      key: 'getCommitssOfComponent',
      value: function getCommitssOfComponent(name) {
        var serialize = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
        var componentList = [];
        componentList = this.componentList.filter(function (item) {
          return item.fiberName === name;
        });

        if (serialize) {
          componentList = componentList.map(function (item) {
            return item.toSerializable();
          });
        }

        return _objectSpread(
          _objectSpread({}, this),
          {},
          {
            componentList: componentList,
          },
        );
      }, // stretch feature, possible todo but needs extensive testing.
    },
    {
      key: 'setStateOfRender',
      value: function setStateOfRender() {
        this.componentList.forEach(function (component) {
          if (component.tag === 1 && component.memoizedState) {
            console.log(component.stateNode);
            component.stateNode.setState(_objectSpread({}, component.memoizedState));
          }
        });
      },
    },
  ]);

  return Tree;
})();

var Observable = /*#__PURE__*/ (function () {
  function Observable() {
    classCallCheck(this, Observable);

    this.observers = [];
  }

  createClass(Observable, [
    {
      key: 'subscribe',
      value: function subscribe(f) {
        this.observers.push(f);
      },
    },
    {
      key: 'unsubsribe',
      value: function unsubsribe(f) {
        this.observers = this.observers.filter(function (sub) {
          return sub !== f;
        });
      },
    },
    {
      key: 'notify',
      value: function notify(data) {
        this.observers.forEach(function (observer) {
          return observer(data);
        });
      },
    },
  ]);

  return Observable;
})();

var changes$1 = [];
var processedFibers$1 = new WeakMap();
var fiberMap$1 = new Map();

function mountToReactRoot(reactRoot, projectID) {
  // Reset changes
  changes$1 = [];
  var changeObservable = new Observable();

  function getSet(obj, propName) {
    var newPropName = '_'.concat(propName);
    obj[newPropName] = obj[propName];
    Object.defineProperty(obj, propName, {
      get: function get() {
        return this[newPropName];
      },
      set: function set(newVal) {
        this[newPropName] = newVal;
        changes$1.push(new Tree(this[newPropName], fiberMap$1, processedFibers$1));
        changeObservable.notify(changes$1);
        if (projectID) sendData(changes$1, projectID);
      },
    });
  } // Lift parent of react fibers tree

  var parent = reactRoot._reactRootContainer._internalRoot;
  changes$1.push(new Tree(parent.current, fiberMap$1, processedFibers$1));
  if (projectID) sendData(changes$1, projectID); // Add listener to react fibers tree so changes can be recorded

  getSet(parent, 'current');
  return {
    changes: changes$1,
    changeObserver: changeObservable,
  };
}

function scrubCircularReferences(changes) {
  // loop through the different commits
  // for every commit check the componentList
  // scrub the circular references and leave the flat one there
  var scrubChanges = changes.map(function (commit) {
    return commit.componentList.map(function (component) {
      return component.toSerializable();
    });
  });
  return scrubChanges;
}

function removeCircularRefs(changes) {
  // loop through the different commits
  // for every commit check the componentList
  // scrub the circular references and leave the flat one there
  var scrubChanges = changes.map(function (commit) {
    return commit.componentList.map(function (component) {
      return component.toSerializable();
    });
  });
  return scrubChanges;
}
/**
 *
 * @param {number} threshold The rendering time to filter for.
 */

function getAllSlowComponentRenders(changes, threshold) {
  // referencing "changes" in the global scope
  var scrubChanges = removeCircularRefs(changes); // rework this so that we can use the pre-serialized data

  var result = scrubChanges.map(function (commit) {
    return commit.filter(function (component) {
      return component.self_base_duration >= threshold;
    });
  });
  return result;
} // function checkTime(fiber, threshold) {
//   return fiber.selfBaseDuration > threshold;
// }
// function getComponentRenderTime(componentName) {
//   console.log("changes", changes);
//   console.log("component name", componentName);
//   return "what";
// }

function getTotalCommitCount(changes, name, storageType) {
  var componentStore = new Map();
  var filteredChanges = [];

  if (name) {
    filteredChanges = changes.map(function (commit) {
      return commit.getCommitssOfComponent(name);
    });
  } else {
    filteredChanges = changes;
  } // looping through each commit's componentList to tally up the renderCount

  filteredChanges.forEach(function (commit, commitIndex) {
    commit.componentList.forEach(function (component, componentIndex) {
      if (!componentStore.has(component.uID)) {
        componentStore.set(component.uID, {
          component: component,
          renderCount: 1,
        });
      } else {
        if (didFiberRender(changes[commitIndex ? commitIndex - 1 : 0].componentList[componentIndex], component)) {
          componentStore.get(component.uID).renderCount += 1;
        }
      }
    });
  });
  var result = [];

  if (storageType && storageType === 'array') {
    result = Array.from(componentStore.values());
  } else {
    result = componentStore;
  }

  return result;
}

function didFiberRender(prevFiber, nextFiber) {
  switch (nextFiber.tag) {
    case 0:
    case 1:
    case 3:
      // case 5:
      return (nextFiber.effectTag & 1) === 1;

    default:
      return (
        prevFiber.memoizedProps !== nextFiber.memoizedProps ||
        prevFiber.memoizedState !== nextFiber.memoizedState ||
        prevFiber.ref !== nextFiber.ref
      );
  }
}

function sendData(_x, _x2) {
  return _sendData.apply(this, arguments);
}

function _sendData() {
  _sendData = asyncToGenerator(
    /*#__PURE__*/ regenerator.mark(function _callee(changes, projectID) {
      var data, request, response;
      return regenerator.wrap(function _callee$(_context) {
        while (1) {
          switch ((_context.prev = _context.next)) {
            case 0:
              if (projectID) {
                _context.next = 2;
                break;
              }

              return _context.abrupt('return');

            case 2:
              data = scrubCircularReferences(changes);
              console.log(data);
              _context.next = 6;
              return fetch('https://react-pinpoint-api.herokuapp.com/api/commit/'.concat(projectID), {
                method: 'POST',
                mode: 'cors',
                credentials: 'include',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  changes: data[data.length - 1],
                }),
              });

            case 6:
              request = _context.sent;
              _context.next = 9;
              return request.json();

            case 9:
              response = _context.sent;
              console.log('response from server', response);

            case 11:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee);
    }),
  );
  return _sendData.apply(this, arguments);
}

// workaround since we're eval-ing this in browser context
function report(_x5) {
  return _report.apply(this, arguments);
}

function _report() {
  _report = asyncToGenerator(
    /*#__PURE__*/ regenerator.mark(function _callee3(page) {
      var threshold,
        slowRenders,
        _args3 = arguments;
      return regenerator.wrap(function _callee3$(_context3) {
        while (1) {
          switch ((_context3.prev = _context3.next)) {
            case 0:
              threshold = _args3.length > 1 && _args3[1] !== undefined ? _args3[1] : 0;
              _context3.next = 3;
              return page.evaluate(
                /*#__PURE__*/ (function () {
                  var _ref = asyncToGenerator(
                    /*#__PURE__*/ regenerator.mark(function _callee2(threshold) {
                      var result;
                      return regenerator.wrap(function _callee2$(_context2) {
                        while (1) {
                          switch ((_context2.prev = _context2.next)) {
                            case 0:
                              result = getAllSlowComponentRenders(changes, threshold);
                              return _context2.abrupt('return', JSON.stringify(result));

                            case 2:
                            case 'end':
                              return _context2.stop();
                          }
                        }
                      }, _callee2);
                    }),
                  );

                  return function (_x6) {
                    return _ref.apply(this, arguments);
                  };
                })(),
                threshold,
              );

            case 3:
              slowRenders = _context3.sent;
              return _context3.abrupt('return', JSON.parse(slowRenders));

            case 5:
            case 'end':
              return _context3.stop();
          }
        }
      }, _callee3);
    }),
  );
  return _report.apply(this, arguments);
}

export {getAllSlowComponentRenders, getTotalCommitCount, mountToReactRoot, report, scrubCircularReferences};
