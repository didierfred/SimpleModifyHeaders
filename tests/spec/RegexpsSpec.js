describe('Regexps', function () {
    describe('Regexps with no url_contains', function () {
        const testCases = [
            {target_page: '', url_contains: undefined, expected: ['.*']},
            {target_page: 'http://test', url_contains: undefined, expected: ['http://test$']},
            {target_page: 'http://*', url_contains: undefined, expected: ['http://.*']},
            {target_page: 'http://*/****', url_contains: undefined, expected: ['http://.*/.*']},
            {target_page: 'http://*test', url_contains: undefined, expected: ['http://.*test$']},
            {target_page: 'http://*test*', url_contains: undefined, expected: ['http://.*test.*']},
            {target_page: 'http://test./test', url_contains: undefined, expected: ['http://test\\./test$']},
            {target_page: 'http://test+/test', url_contains: undefined, expected: ['http://test\\+/test$']},
            {target_page: 'http://test?param=2', url_contains: undefined, expected: ['http://test\\?param=2$']}
        ];

        testCases.forEach(({target_page, url_contains, expected}) => {
            it(`target_page = "${target_page}" , url_contains = "${url_contains}" ==>  "${expected}"`, function () {
                expect(getRegExpFromConfig(target_page, url_contains)).toEqual(expected);
            });
        });
    });

    describe('Regexps with url_contains', function () {
        const testCases = [
            {target_page: '', url_contains: 'test', expected: ['.*test.*']},
            {target_page: 'http://test', url_contains: 'test', expected: ['http://test$']},
            {target_page: 'http://myurl', url_contains: 'test', expected: []}, // no match possible
            {target_page: 'http://*', url_contains: 'te$st', expected: ['http://.*te\\$st.*']},
            {target_page: 'http://*', url_contains: 'te*st', expected: ['http://.*te\\*st.*']},
            {target_page: 'http://*/*', url_contains: 'test', expected: ['http://.*test.*/.*|http://.*/.*test.*']},
            {
                target_page: 'http://*/*',
                url_contains: 'te+st',
                expected: ['http://.*te\\+st.*/.*|http://.*/.*te\\+st.*']
            },
            {
                target_page: 'http://*value/*value/*value',
                url_contains: 'test',
                expected: [
                    'http://.*test.*value/.*value/.*value$|http://.*value/.*test.*value/.*value$|http://.*value/.*value/.*test.*value$'
                ]
            }
        ];

        testCases.forEach(({target_page, url_contains, expected}) => {
            it(`target_page = "${target_page}" , url_contains = "${url_contains}" ==>  "${expected}"`, function () {
                expect(getRegExpFromConfig(target_page, url_contains)).toEqual(expected);
            });
        });
    });

    describe('Regexps with multiple target page', function () {
        const testCases = [
            {target_page: 'http://test;http://hello', url_contains: '', expected: ['http://test$', 'http://hello$']},
            {target_page: 'http://test;http://hello', url_contains: 'hello', expected: ['http://hello$']},
            {target_page: 'http://test;;;', url_contains: undefined, expected: ['http://test$']},
            {
                target_page: 'http://test;;;http://othertest/test*',
                url_contains: undefined,
                expected: ['http://test$', 'http://othertest/test.*']
            }
        ];

        testCases.forEach(({target_page, url_contains, expected}) => {
            it(`target_page = "${target_page}" , url_contains = "${url_contains}" ==>  "${expected}"`, function () {
                expect(getRegExpFromConfig(target_page, url_contains)).toEqual(expected);
            });
        });
    });
});
