define(['common/utils/path_manipulator'], function (PathManipulator){
  describe("pathFromUrl", function () {

    it("should return the correct path in public/images", function () {
      var url = 'http://localhost:3057/performance/no-realistic-dashboard/realtime.png?raw';
      expect(PathManipulator.imagePathFromUrl(url)).toEqual('./tmp/no-realistic-dashboard-realtime-raw.png')
    });
  });

});
