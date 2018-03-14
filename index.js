const _ = require('lodash');


/**
 * Base router class. It just wraps original express router for
 * promise support.
 */
class PromiseRouter {
  constructor() {
    this.router_ = require('express').Router();
  }


  /**
   * Returns original express router.
   * @return {Object}
   */
  getOriginal() {
    return this.router_;
  }


  /**
   * Wraps param() method.
   */
  param() {
    return this.router_.param.apply(this.router_, arguments);
  }


  /**
   * Wraps use() method.
   */
  use() {
    return this.router_.use.apply(this.router_, arguments);
  }


  /**
   * Handles and return new arguments array.
   * @return {Array}
   */
  handleArguments_() {
    const args = Array.prototype.slice.call(arguments);

    return _.map(args, (arg, i, args) => {
      if (i == 0)
        return arg;

      return this.wrapHandler_(arg, i == args.length - 1);
    });
  }


  /**
   * Wraps promise-using handler for original express router. Flow:
   * - Executes the promise-using handler
   * - If some error occurs, calls `next(err)`
   * - If there is no error and returning value is promise
   * - Listen that promise for fullfilling or rejection
   * - If promise is rejected, calls `next(err)`
   * - If promise is fullfilled
   * - If handler is not the last one (middleware), calls `next()`
   * - If the last handler, calls `res.json(data)`
   *
   * @param {Function} handler
   * @param {boolean=} opt_isLast
   * @return {Function}
   */
  wrapHandler_(handler, opt_isLast) {
    if (isAsync(handler) || isPromise(handler) || _.isFunction(handler))
      return function(req, res, next) {
        try {
          // If not promise, this function will execute automatically.
          const rv = handler(req, res, next);

          // Check if promise, if yes, execute then.
          if (isPromise(rv)) {
            rv
              .then(data => {
                if (opt_isLast && data)
                  res.json(data);
                else if (!opt_isLast)
                  next();
              })
              .catch(next);
          } else {
            next();
          }
        } catch (err) {
          next(err);
        }
      }

    throw new Error('PromiseRouter: Handler must be a function!');
  }


  /**
   * Wraps get() method.
   */
  get() {
    const args = this.handleArguments_.apply(this, arguments);
    return this.router_.get.apply(this.router_, args);
  }


  /**
   * Wraps post() method.
   */
  post() {
    const args = this.handleArguments_.apply(this, arguments);
    return this.router_.post.apply(this.router_, args);
  }


  /**
   * Wraps put() method.
   */
  put() {
    const args = this.handleArguments_.apply(this, arguments);
    return this.router_.put.apply(this.router_, args);
  }


  /**
   * Wraps delete() method.
   */
  delete() {
    const args = this.handleArguments_.apply(this, arguments);
    return this.router_.delete.apply(this.router_, args);
  }
}


/**
 * Checks whether given value is promise or not. We're just checking
 * then() method, because that's the only standard promise libraries use.
 * @param {*} val
 * @return {boolean}
 */
function isPromise(val) {
  return _.isObject(val) && _.isFunction(val.then);
}

function isAsync(fn) {
  return fn.constructor.name === 'AsyncFunction';
}

module.exports = PromiseRouter;
