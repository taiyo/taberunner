userid=1

// 本当は非同期でやりたいけどデモなのでこのまま
function getJSON(url) {
  var req = new XMLHttpRequest();
  req.open("GET", url, false);
  req.send();
  if(req.readyState == 4 && req.status == 200){
    var data = JSON.parse(req.responseText);
    return data;
  }
}

function convertCoordinate(longitude, latitude) {
  return ol.proj.transform([longitude, latitude], "EPSG:4326","EPSG:900913");
}

// デフォルトのスタイル
var defaultBig = new ol.style.Style({
  image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ {
    anchor: [0.5, 1],
    anchorXUnits: 'fraction',
    anchorYUnits: 'fraction',
    opacity: 0.75,
    src: 'icon/normal-lg.png'
  })
});

var defaultSmall = new ol.style.Style({
  image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ {
    anchor: [0.5, 1],
    anchorXUnits: 'fraction',
    anchorYUnits: 'fraction',
    opacity: 0.75,
    src: 'icon/normal-sm.png'
  })
});

var marked = new ol.style.Style({
  image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ {
    anchor: [0.5, 1],
    anchorXUnits: 'fraction',
    anchorYUnits: 'fraction',
    opacity: 0.75,
    src: 'icon/like-lg.png'
  })
});

var foods = getJSON("data/food.json");
// var datas = getJSON("data/test.json");
var datas = getJSON("https://k990dbgtb0.execute-api.ap-northeast-1.amazonaws.com/prod/likes?userid=" + userid);

var features = [];
var selected;
for(var key in foods) {
  var food = foods[key];
  var data = datas[key];
  var prop = {
    geometry: new ol.geom.Point(convertCoordinate(food["lon"], food["lat"])),
    name: food["name"],
    like: data["likes"],
    // time: data["time"],
    img: food["img"],
    href: food["href"]
  };
  var markerFeature = new ol.Feature(prop);
  if (data["liked"]) {
    markerFeature.setStyle(marked);
    console.log("selected");
    console.log(marked);
    selected = prop;
  } else {
    if(data["likes"] > 5) {
      markerFeature.setStyle(defaultBig);
    } else {
      markerFeature.setStyle(defaultSmall);
    }
  }
  features.push(markerFeature);
}

// Feature 一覧 を Source にセット
var markerSource = new ol.source.Vector({
  features: features
});

// Source を Layer にセット
var markerLayer = new ol.layer.Vector({
  source: markerSource,
  style: defaultSmall
});
