describe("guid", function () {
    it("newGuid format is correct", function () {
        return expect(Guid.regex().test(Guid.newGuid().valueOf())).toBeTruthy();
    });
    it("empty format is correct", function () {
        return expect(Guid.regex().test(Guid.empty().valueOf())).toBeTruthy();
    });
    it("toString with 'X' parameter format is correct", function () {
        return expect(Guid.regex('x').test(Guid.empty().toString('x'))).toBeTruthy();
    });
});
