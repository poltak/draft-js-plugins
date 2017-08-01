/* @flow */

import escapeRegExp from 'lodash/escapeRegExp';

export default (trigger: string, regExp: string) => (contentBlock: Object, callback: Function) => {
  findWithRegex(new RegExp(`(\\s|^)${escapeRegExp(trigger)}${regExp}`, 'g'), contentBlock, callback);
};
