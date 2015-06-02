OSMtools = {
   loadOSM: function(bounds, cb) {
      var url = "http://api.openstreetmap.org/api/0.6/map?bbox=" + bounds.ul.x + "," + bounds.lr.y + "," + bounds.lr.x + "," + bounds.ul.y;
      var xhr = new window.XMLHttpRequest();
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            cb(data);
          } else {
            cb(null);
          }
        }
      };
      xhr.open("get", url);
      xhr.send();
    },
}
   