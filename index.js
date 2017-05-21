'use strict';

process.env.DEBUG = 'actions-on-google:*';
const App = require('actions-on-google').ApiAiApp;

const TELL_RESOURCES_ACTION = 'tell_resources';
const TELL_HABITATS_ACTION = 'tell_habitats';
const BUY_HABITAT_ACTION = 'buy_habitat';
const BUY_DRAGON_ACTION = 'buy_dragon';
const HABITAT_ARGUMENT = 'habitatType';
const DRAGON_ARGUMENT = 'dragonType';
const RESOURCE_ARGUMENT = 'resourceType';

let habitatTypes = {
    'fire': {
        'price': 150,
        'space': 2
    },
    'water': {
        'price': 500,
        'space': 1
    },
    'nature': {
        'price': 12000,
        'space': 2
    }
}

let dragonTypes = {
    'fire': {
        'price': 100,
        'production': 127
    },
    'water': {
        'price': 350,
        'production': 51
    },
    'nature': {
        'price': 500,
        'production': 153
    }
}

exports.dragonCityAssistant = (request, response) => {
  const app = new App({request, response, sessionStarted});
  console.log('Request headers: ' + JSON.stringify(request.headers));
  console.log('Request body: ' + JSON.stringify(request.body));

  function tellList (list) {
      let msg = '';
      for (let i =0; i<list.length; i++) {
          msg += list[i];
          if (i < list.length-2) {
              msg += ', ';
          } else if (i == list.length-2) {
              msg += ' and ';
          }
      }
      return msg;
  }

  function sessionStarted (app) {
    app.data.map = [];
    app.data.resources = {
      'gold': 1000,
      'food': 1000,
      'gems': 50
    };
    console.log('welcome!');
  }

  function tellHabitats (app) {
      let typeCounts = []
      for (let habitat of app.data.map) {
          let htype = habitat['type'];
          if(typeCounts[htype] == undefined) {
              typeCounts[htype] = 0;
          }
          typeCounts[htype]++
      }

      if(typeCounts.length == 0) {
          app.tell('You don\'t have any habitats.');
          return;
      }

      let mlist = [];
      for(let htype of Object.keys(typeCounts)) {
          let c = typeCounts[htype];
          let suffix = c == 1 ? 'habitat' : 'habitats';
          mlist.push(''+c+' '+htype+' '+suffix);
      }

      app.tell('You have '+tellList(mlist) + '.');
  }

  function tellResources (app) {
    let rtypes = app.getArgument(RESOURCE_ARGUMENT);
    console.log(app.data);
    if(rtypes.length == 0) {
        rtypes = Object.keys(app.data.resources);
    }
    let mlist = []
    for (let rtype of rtypes) {
        mlist.push(''+app.data.resources[rtype]+' '+rtype);
    }

    app.tell('You have '+tellList(mlist) + '.');
  }

  function buyHabitat (app) {
    let htype = app.getArgument(HABITAT_ARGUMENT);

    let config = habitatTypes[htype];
    if(app.data.resources['gold'] < config['price']) {
        app.tell('Sorry, you don\'t have enough gold to buy a ' + htype + ' habitat!');
        return;
    }

    app.data.resources['gold'] -= config['price'];

    map.push({
        'type': htype,
        'dragons': []
    });

    app.tell('Alright, you bought a ' + htype + ' habitat!');
  }

  function buyDragon (app) {
    let dtype = app.getArgument(DRAGON_ARGUMENT);
    app.tell('Alright, you bought a ' + dtype + ' dragon!');
  }

  let actionMap = new Map();
  actionMap.set(TELL_RESOURCES_ACTION, tellResources);
  actionMap.set(TELL_HABITATS_ACTION, tellHabitats);
  actionMap.set(BUY_HABITAT_ACTION, buyHabitat);
  actionMap.set(BUY_DRAGON_ACTION, buyDragon);

  app.handleRequest(actionMap);
};
