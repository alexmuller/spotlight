define([], function(){
  var PathManipulator = {
    imagePathFromUrl: function (url){
      parts = url.split("/");
      parts.splice(0,4);
      whole = parts.join("-");
      formatted_whole = whole.replace(".png", "").replace("?", "-");
      return "./tmp/" + formatted_whole + ".png";
    }
  };

  return PathManipulator;

});
