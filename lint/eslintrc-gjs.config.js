// https://gitlab.gnome.org/GNOME/gnome-shell/-/blob/14ba1c2ffad7b204eb61be3a31bddecc029b0c1a/lint/eslintrc-gjs.yml
// but adapted to flat config files

import js from '@eslint/js';
import jsdoc from 'eslint-plugin-jsdoc';
import globals from 'globals';

export default [
    js.configs.recommended,
    {
        plugins: {
            jsdoc,
        },
        settings: {
            jsdoc: {
                mode: 'typescript',
            },
        },
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: {
                ...globals.es2021,
                ARGV: 'readonly',
                Debugger: 'readonly',
                GIRepositoryGType: 'readonly',
                globalThis: 'readonly',
                imports: 'readonly',
                Intl: 'readonly',
                log: 'readonly',
                logError: 'readonly',
                print: 'readonly',
                printerr: 'readonly',
                window: 'readonly',
                TextEncoder: 'readonly',
                TextDecoder: 'readonly',
                console: 'readonly',
                setTimeout: 'readonly',
                setInterval: 'readonly',
                clearTimeout: 'readonly',
                clearInterval: 'readonly',
            },
        },
        rules: {
            'array-bracket-newline': ['error', 'consistent'],
            'array-bracket-spacing': ['error', 'never'],
            'array-callback-return': 'error',
            'arrow-parens': ['error', 'as-needed'],
            'arrow-spacing': 'error',
            'block-scoped-var': 'error',
            'block-spacing': 'error',
            'brace-style': 'error',
            'comma-dangle': [
                'error',
                {
                    arrays: 'always-multiline',
                    objects: 'always-multiline',
                    functions: 'never',
                },
            ],
            'comma-spacing': [
                'error',
                {
                    before: false,
                    after: true,
                },
            ],
            'comma-style': ['error', 'last'],
            'computed-property-spacing': 'error',
            curly: ['error', 'multi-or-nest', 'consistent'],
            'dot-location': ['error', 'property'],
            'eol-last': 'error',
            eqeqeq: 'error',
            'func-call-spacing': 'error',
            'func-name-matching': 'error',
            'func-style': [
                'error',
                'declaration',
                {
                    allowArrowFunctions: true,
                },
            ],
            indent: [
                'error',
                4,
                {
                    ignoredNodes: [
                        'CallExpression[callee.object.name=GObject][callee.property.name=registerClass] > ClassExpression:first-child',
                    ],
                    MemberExpression: 'off',
                },
            ],
            'jsdoc/check-alignment': 'error',
            'jsdoc/check-param-names': 'error',
            'jsdoc/check-tag-names': 'error',
            'jsdoc/check-types': 'error',
            'jsdoc/implements-on-classes': 'error',
            'jsdoc/tag-lines': [
                'error',
                'any',
                {
                    startLines: 1,
                },
            ],
            'jsdoc/require-jsdoc': 'error',
            'jsdoc/require-param': 'error',
            'jsdoc/require-param-description': 'error',
            'jsdoc/require-param-name': 'error',
            'jsdoc/require-param-type': 'error',
            'key-spacing': [
                'error',
                {
                    beforeColon: false,
                    afterColon: true,
                },
            ],
            'keyword-spacing': [
                'error',
                {
                    before: true,
                    after: true,
                },
            ],
            'linebreak-style': ['error', 'unix'],
            'lines-between-class-members': [
                'error',
                'always',
                {
                    exceptAfterSingleLine: true,
                },
            ],
            'max-nested-callbacks': 'error',
            'max-statements-per-line': 'error',
            'new-parens': 'error',
            'no-array-constructor': 'error',
            'no-await-in-loop': 'error',
            'no-caller': 'error',
            'no-constant-condition': [
                'error',
                {
                    checkLoops: false,
                },
            ],
            'no-div-regex': 'error',
            'no-empty': [
                'error',
                {
                    allowEmptyCatch: true,
                },
            ],
            'no-extra-bind': 'error',
            'no-extra-parens': [
                'error',
                'all',
                {
                    conditionalAssign: false,
                    nestedBinaryExpressions: false,
                    returnAssign: false,
                },
            ],
            'no-implicit-coercion': [
                'error',
                {
                    allow: ['!!'],
                },
            ],
            'no-invalid-this': 'error',
            'no-iterator': 'error',
            'no-label-var': 'error',
            'no-lonely-if': 'error',
            'no-loop-func': 'error',
            'no-nested-ternary': 'error',
            'no-new-object': 'error',
            'no-new-wrappers': 'error',
            'no-octal-escape': 'error',
            'no-proto': 'error',
            'no-prototype-builtins': 'off',
            'no-restricted-globals': ['error', 'window'],
            'no-restricted-properties': [
                'error',
                {
                    object: 'Lang',
                    property: 'copyProperties',
                    message: 'Use Object.assign()',
                },
                {
                    object: 'Lang',
                    property: 'bind',
                    message: 'Use arrow notation or Function.prototype.bind()',
                },
                {
                    object: 'Lang',
                    property: 'Class',
                    message: 'Use ES6 classes',
                },
            ],
            'no-restricted-syntax': [
                'error',
                {
                    selector:
                        'MethodDefinition[key.name="_init"] > FunctionExpression[params.length=1] > BlockStatement[body.length=1] CallExpression[arguments.length=1][callee.object.type="Super"][callee.property.name="_init"] > Identifier:first-child',
                    message:
                        '_init() that only calls super._init() is unnecessary',
                },
                {
                    selector:
                        'MethodDefinition[key.name="_init"] > FunctionExpression[params.length=0] > BlockStatement[body.length=1] CallExpression[arguments.length=0][callee.object.type="Super"][callee.property.name="_init"]',
                    message:
                        '_init() that only calls super._init() is unnecessary',
                },
                {
                    selector:
                        'BinaryExpression[operator="instanceof"][right.name="Array"]',
                    message: 'Use Array.isArray()',
                },
            ],
            'no-return-assign': 'error',
            'no-return-await': 'error',
            'no-self-compare': 'error',
            // 'no-shadow': 'error',
            'no-shadow-restricted-names': 'error',
            'no-spaced-func': 'error',
            'no-tabs': 'error',
            'no-template-curly-in-string': 'error',
            'no-throw-literal': 'error',
            'no-trailing-spaces': 'error',
            'no-undef-init': 'error',
            'no-unneeded-ternary': 'error',
            'no-unused-expressions': 'error',
            'no-unused-vars': [
                'error',
                {
                    varsIgnorePattern: '(^unused|_$)',
                    argsIgnorePattern: '^(unused|_)',
                },
            ],
            'no-useless-call': 'error',
            'no-useless-computed-key': 'error',
            'no-useless-concat': 'error',
            'no-useless-constructor': 'error',
            'no-useless-rename': 'error',
            'no-useless-return': 'error',
            'no-whitespace-before-property': 'error',
            'no-with': 'error',
            'nonblock-statement-body-position': ['error', 'below'],
            'object-curly-newline': [
                'error',
                {
                    consistent: true,
                    multiline: true,
                },
            ],
            'object-curly-spacing': 'error',
            'object-shorthand': 'error',
            'operator-assignment': 'error',
            'operator-linebreak': 'error',
            'padded-blocks': ['error', 'never'],
            'prefer-numeric-literals': 'error',
            'prefer-promise-reject-errors': 'error',
            'prefer-rest-params': 'error',
            'prefer-spread': 'error',
            quotes: [
                'error',
                'single',
                {
                    avoidEscape: true,
                },
            ],
            'require-await': 'error',
            'rest-spread-spacing': 'error',
            semi: ['error', 'always'],
            'semi-spacing': [
                'error',
                {
                    before: false,
                    after: true,
                },
            ],
            'semi-style': 'error',
            'space-before-blocks': 'error',
            'space-before-function-paren': [
                'error',
                {
                    named: 'never',
                    anonymous: 'always',
                    asyncArrow: 'always',
                },
            ],
            'space-in-parens': 'error',
            'space-infix-ops': [
                'error',
                {
                    int32Hint: false,
                },
            ],
            'space-unary-ops': 'error',
            'spaced-comment': 'error',
            'switch-colon-spacing': 'error',
            'symbol-description': 'error',
            'template-curly-spacing': 'error',
            'template-tag-spacing': 'error',
            'unicode-bom': 'error',
            'wrap-iife': ['error', 'inside'],
            'yield-star-spacing': 'error',
            yoda: 'error',
        },
    },
];
