describe('Patterns', function () {
    describe('Pattend with no url_contains', function () {
        const testCases = [
            {target_page: '', url_contains: undefined, expected: ['*']},
            {target_page: 'http://test', url_contains: undefined, expected: ['http://test|']},
            {target_page: 'http://*', url_contains: undefined, expected: ['http://*']},
            {target_page: 'http://*/****', url_contains: undefined, expected: ['http://*/*']},
            {target_page: 'http://*test', url_contains: undefined, expected: ['http://*test|']},
            {target_page: 'http://*test*', url_contains: undefined, expected: ['http://*test*']},
        ];

        testCases.forEach(({target_page, url_contains, expected}) => {
            it(`target_page = "${target_page}" , url_contains = "${url_contains}" ==>  "${expected}"`, function () {
                expect(getPatternMatchingFromConfig(target_page, url_contains)).toEqual(expected);
            });
        });
    });

    describe('Regexps with url_contains', function () {
        const testCases = [
            {target_page: '', url_contains: 'test', expected: ['*test*']},
            {target_page: 'http://test', url_contains: 'test', expected: ['http://test|']},
            {target_page: 'http://test*', url_contains: 'test', expected: ['http://test*']},
            {target_page: 'http://test', url_contains: 'other;test', expected: ['http://test|']},
            {target_page: 'http://test*', url_contains: 'other;test', expected: ['http://test*']},
            {target_page: 'http://other*god', url_contains: 'other;test', expected: ['http://other*god|']},
            {target_page: 'http://myurl', url_contains: 'test', expected: []}, // no match possible
            {target_page: 'http://*', url_contains: 'te$st', expected: ['http://*te$st*']},
            {target_page: 'http://*', url_contains: 'te*st', expected: ['http://*te*st*']},
            {target_page: 'http://*/*', url_contains: 'test', expected: ['http://*test*/*','http://*/*test*']},
            {target_page: 'http://*/*', url_contains: 'test;other', expected: ['http://*test*/*','http://*/*test*','http://*other*/*','http://*/*other*']},
            {
                target_page: 'http://*value/*value/*value',
                url_contains: 'test',
                expected: [
                    'http://*test*value/*value/*value|','http://*value/*test*value/*value|','http://*value/*value/*test*value|'
                ]
            }
        ];

        testCases.forEach(({target_page, url_contains, expected}) => {
            it(`target_page = "${target_page}" , url_contains = "${url_contains}" ==>  "${expected}"`, function () {
                expect(getPatternMatchingFromConfig(target_page, url_contains)).toEqual(expected);
            });
        });
    });

    describe('Regexps with multiple target page', function () {
        const testCases = [
            {target_page: 'http://test;http://hello', url_contains: '', expected: ['http://test|', 'http://hello|']},
            {target_page: 'http://test;http://hello', url_contains: 'hello', expected: ['http://hello|']},
            {target_page: 'http://test;;;', url_contains: undefined, expected: ['http://test|']},
            {
                target_page: 'http://test;;;http://othertest/test*',
                url_contains: undefined,
                expected: ['http://test|', 'http://othertest/test*']
            }
        ];

        testCases.forEach(({target_page, url_contains, expected}) => {
            it(`target_page = "${target_page}" , url_contains = "${url_contains}" ==>  "${expected}"`, function () {
                expect(getPatternMatchingFromConfig(target_page, url_contains)).toEqual(expected);
            });
        });
    });
});
