
import globals from 'globals';
import pluginJs from '@eslint/js';

/** @type {import('eslint').Linter.Config[]} */
export default [
	pluginJs.configs.recommended,
	{
        languageOptions: {
			globals: globals.browser
		},
		rules: {
			'quotes': ['error', 'single', {allowTemplateLiterals: true, avoidEscape: false}],
			'max-len': ['error', {code: 160, tabWidth: 4}],
			'semi': 'error',
			'prefer-const': 'error',
			'no-unused-vars': 'warn',
			//'no-unused-vars': 'error',
			'no-constructor-return': 'error',
			//'no-duplicate-imports': 'error',
			'no-inner-declarations': 'error',
			'no-self-compare': 'error',
			'no-unmodified-loop-condition': 'error',
			'no-use-before-define': 'error',
			'no-useless-assignment': 'error'
		}
	}
];