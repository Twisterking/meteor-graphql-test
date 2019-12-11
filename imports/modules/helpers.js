import { Groups } from '../db';

export const emailRegex = (/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);

export function toNodeEncoding(encoding) {
  // this function returns the common NodeJS encodings from other "formats"
  if ((['UTF-8']).indexOf(encoding) !== -1) return 'utf8';
  if ((['ISO-8859-1']).indexOf(encoding) !== -1) return 'latin1';
}

export function checkUrl(currentPath, urlstring) {
  let classes = [];
  let index = currentPath.indexOf(urlstring);
  if (index !== -1) {
    classes.push('active');
    if (index >= (currentPath.length - urlstring.length)) classes.push('exact', 'open');
    else classes.push('parent', 'open');
  }
  return classes.join(' ');
}

export function moveFocus(e, direction, isSearch, keyDownHandlers) {
  e.preventDefault();
  if (direction == 'down') {
    if (isSearch) {
      $('input.search.list').focus();
      keyDownHandlers.ArrowDown();
    } else {
      if ($(e.target).parents('.item').nextAll('.selectable').length > 0)
        $(e.target).parents('.item').removeClass('highlighted').nextAll('.selectable').first().addClass('highlighted').find('.amount input').focus();
      else {
        $('input.search.openorder').focus();
      }
    }
  }
  else if (direction == 'up') {
    if (isSearch) {
      $('input.search.list').focus();
      keyDownHandlers.ArrowUp();
    } else {
      if ($(e.target).parents('.item').prevAll('.selectable').length > 0)
        $(e.target).parents('.item').removeClass('highlighted').prevAll('.selectable').first().addClass('highlighted').find('.amount input').focus();
      else
        $(e.target).blur();
    }
  }
  else if (direction == 'first-item') {
    $(e.target).parents('.main-container').find('.itemlist.itemlist-search').find('li.listitem').first().find('.amount input').focus();
  }
}

// https://stackoverflow.com/questions/9719570/generate-random-password-string-with-requirements-in-javascript/9719815
export function randomPassword() {
  return Math.random().toString(36).slice(-8);
}

export function empty(val) {
  if (typeof val == 'undefined' ||
    !val ||
    val === undefined ||
    val == null ||
    val == "null" ||
    val == "(null)" ||
    val === "" ||
    val === " " ||
    (typeof val == 'object' && !(val instanceof Date) && Object.keys(val).length === 0) ||
    (Array.isArray(val) && val.length === 0) ||
    (/^\s*$/).test(val))
    return true;
  else
    return false;
}

// http://stackoverflow.com/questions/811195/fast-open-source-checksum-for-small-strings
export function getChecksum(s) {
  if (Array.isArray(s)) {
    if (typeof s[0] == 'object') {
      if (s[0]._id) s = s.map(val => val._id);
    }
    s = s.join('-');
  }
  let chk = 0x12345678;
  let len = s.length;
  for (let i = 0; i < len; i++) {
    chk += (s.charCodeAt(i) * (i + 1));
  }
  return (chk & 0xffffffff).toString(16);
}

// https://stackoverflow.com/questions/13605340/how-to-validate-a-ean-gtin-barcode-in-javascript
export function eanCheckDigit(s){
  let result = 0;
  for (counter = String(s).length-1; counter >=0; counter--){
    result = result + parseInt(String(s).charAt(counter)) * (1+(2*(counter % 2)));
  }
  return (10 - (result % 10)) % 10;
}

export function getGroupGln(group, supplier, options) {
  let { connectorSettings } = options;
  if(!group) throw new Meteor.Error(422, 'getGroupGln(): No group.');
  if(!supplier) throw new Meteor.Error(422, 'getGroupGln(): No supplier.');
  if(!connectorSettings) {
    connectorSettings = (supplier.internal.connector.receive && supplier.internal.connector.receive.pricat && supplier.internal.connector.receive.pricat.settings) ||
    (supplier.internal.connector.send && supplier.internal.connector.send.orders && supplier.internal.connector.send.orders.settings) ||
    null;
  }

  let glnOrder = connectorSettings && connectorSettings.glnOrder || ['gln'];
  if(connectorSettings && connectorSettings.allowCustomerIdAsGln == true) glnOrder = ['customerId', 'gln'];

  let group_gln = null;
  glnOrder.some(key => {
    if(key == 'customerId' && group.customerId) {
      group_gln = String(group.customerId).padStart(13, '0');
      if(group_gln) {
        // Also append checkDigit
        if(connectorSettings.appendCheckDigit) {
          group_gln = group_gln.substring(1);
          group_gln = (group_gln + eanCheckDigit(group_gln));
        }
        return group_gln;
      }
    } else if(key == 'gln' && group.gln) {
      group_gln = group.gln;
      if(group_gln && String(group_gln).trim().replace(/\s/g,'').length == 13) return group_gln;
    }
    return false;
  });
  if(Meteor.isDevelopment) console.log('getGroupGln()', group_gln);
  return group_gln || false;
}

export function getCleanPrice(price) {
  // € = \u20AC
	let cleanPrice = Math.round(parseFloat(String(price).replace(/\u20AC|\s/ig, '').replace(',', '.')) * 1000) / 1000;
	if(isNaN(cleanPrice)) {
		return 0;
	}
	return cleanPrice;
}

// this function returns a valid mongo query
export function getItemsQuery(itemsQuery, params = {}) {
  let alreadySet = [];
  if(!itemsQuery.$and) {
    if(Object.keys(itemsQuery).length > 0) {
      alreadySet = Object.keys(itemsQuery);
      itemsQuery = { $and: [{...itemsQuery}] };
    }
    else itemsQuery = { $and: [] };
  }
  let { currentUserId, group, groupId, supplierId, specialLists, filter } = params;
  if(!groupId && group) groupId = group._id;
  
  if(!filter) filter = {};
  const { categoryId, categoryIds } = filter;
  if(supplierId) {
    alreadySet.push('supplier_id');
    itemsQuery.$and.push({ supplier_id: supplierId });
  }
  if(groupId) {
    alreadySet.push('groupIds');
    if(filter && filter.groupIds) {
      itemsQuery.$and.push({
        groupIds: groupId
      });
    } else {
      itemsQuery.$and.push({
        $or: [
          { groupIds: { $exists: false } },
          { groupIds: groupId }
        ]
      });
    }
  }
  if(categoryIds || categoryId) {
    alreadySet.push('categoryIds');
    itemsQuery.$and.push({ categoryIds: categoryIds || categoryId });
  }
  if(filter) {
    let moreFilters = {};
    Object.keys(filter).forEach(attr => {
      if(alreadySet.indexOf(attr) == -1) {
        moreFilters[attr] = filter[attr];
      }
    });
    if(Object.keys(moreFilters).length > 0) {
      itemsQuery.$and.push(moreFilters);
    }
  }  
  return getRestrictedItemsQuery(itemsQuery, specialLists);
}

export function getRestrictedItemsQuery(itemsQuery, specialLists, options = {}) {
  if(!specialLists && (!options || !options.limitedItemIds || options.limitedItemIds.length == 0)) return itemsQuery;
  const { idField, limitedItemIds } = options;
  if(!specialLists) specialLists = {};

  let categoryIdsQuery = {};
  let idQuery = {};
  let additionalQueryType = '$or';
  if (specialLists.whitelist) {
    if(specialLists.whitelist.itemIds && specialLists.whitelist.itemIds.length > 0) idQuery.$in = specialLists.whitelist.itemIds;
    if(specialLists.whitelist.categoryIds && specialLists.whitelist.categoryIds.length > 0) categoryIdsQuery.$in = specialLists.whitelist.categoryIds;
  }
  if (specialLists.blacklist) {
    additionalQueryType = '$and'; // in case of blacklist we need an $and
    if(specialLists.blacklist.itemIds && specialLists.blacklist.itemIds.length > 0) idQuery.$nin = specialLists.blacklist.itemIds;
    if(specialLists.blacklist.categoryIds && specialLists.blacklist.categoryIds.length > 0) categoryIdsQuery.$nin = specialLists.blacklist.categoryIds;
  }
  let $orQuery = null;
  if(additionalQueryType == '$or' && Object.keys(idQuery).length == 1 && Object.keys(categoryIdsQuery).length == 1) {
    $orQuery = { $or: [ { _id: idQuery }, { categoryIds: categoryIdsQuery } ] };
  }
  if(itemsQuery.$and) {
    if($orQuery) itemsQuery.$and.push($orQuery);
    else {
      if(Object.keys(idQuery).length > 0) {
        let pushQuery = {};
        pushQuery[idField || '_id'] = idQuery;
        itemsQuery.$and.push(pushQuery);
      }
      if(Object.keys(categoryIdsQuery).length > 0) {
        itemsQuery.$and.push({ categoryIds: categoryIdsQuery });
      }
    }
    if(limitedItemIds && limitedItemIds.length > 0) {
      itemsQuery.$and.push({ _id: { $in: limitedItemIds } });
    }
  }
  else {
    if($orQuery) {
      itemsQuery = Object.assign($orQuery, itemsQuery);
    } else {
      if(Object.keys(idQuery).length > 0) {
        if (!itemsQuery[idField || '_id']) itemsQuery[idField || '_id'] = {};
        itemsQuery[idField || '_id'] = Object.assign(idQuery, itemsQuery[idField || '_id']);
      }
      if(Object.keys(categoryIdsQuery).length > 0) {
        if(!itemsQuery.categoryIds) {
          itemsQuery.categoryIds = categoryIdsQuery;
        }
      }
      if(limitedItemIds && limitedItemIds.length > 0) {
        itemsQuery[idField || '_id'] = Object.assign({ $in: limitedItemIds }, itemsQuery[idField || '_id']);
      }
    }
  }
  return itemsQuery;
}

export const inputValidation = {
  email: {
    email: {
      message: '^E-Mail Adresse des Kunden ist nicht valide!'
    }
  },
  profile_company_email: {
    email: {
      message: '^Firmen E-Mail Adresse ist nicht valide!'
    }
  },
  profile_supplier_specialSupplierOrderEmail_address: {
    email: {
      message: '^Kundenspezifische Bestell-Email Adresse ist nicht valide!'
    }
  },
  supplierFields_specialSupplierOrderEmail_address: {
    email: {
      message: '^Kundenspezifische Bestell-Email Adresse ist nicht valide!'
    }
  }
}

export function formatPrice(val, options = {}) {
  let { skipCurrency, currency, decimals } = options;
  if(!currency) currency = '€';
  if(!decimals) decimals = 3;
  if (typeof val == 'undefined' || val === null || val === false) return '';
  val = String(parseFloat(Math.round(val * Math.pow(10,decimals)) / Math.pow(10,decimals)).toFixed(decimals)).replace('.', ',');
  if(decimals >= 3 && val.slice(-1) == '0') val = val.slice(0, -1);
  if(skipCurrency) return val;
  return `${currency} ${val}`;
}

export const standardUnitTranslations = {
  "KGM": "kg",
  "PCE": "Stk",
  "CU": "Tas",
  "PK": "Cll",
  "BG": "Sa",
  "BE": "Bnd",
  "PC": "Stk",
  "BTL": "Fl",
  "CAN": "Dose",
  "CTN": "Karton",
  "BRL": "Fass",
  "LTR": "l",
  // FROM AGM:
  "BA": "Ballon",
  "BT": "Beutel",
  "BL": "Blister",
  "BX": "Box",
  "BR": "Brief",
  "BF": "Brief",
  "BD": "Bund",
  "BU": "Bund",
  "CO": "Container",
  "COU": "Coupon",
  "DI": "Display",
  "DP": "Doppelpackung",
  "DS": "Dose",
  "EI": "Eimer",
  "ET": "Etui",
  "FA": "Fass",
  "FL": "Flasche",
  "GA": "Garnitur",
  "GK": "Geschenkkarton",
  "GL": "Glas",
  "KA": "Kanister",
  "KT": "Karton",
  "KI": "Kiste",
  "KO": "Koffer",
  "KL": "Kollektion",
  "KB": "Korb",
  "K": "Korb",
  "KU": "Kübel",
  "LB": "Laib",
  "L": "Liter",
  "LO": "Lose",
  "NE": "Netz",
  "NT": "Netz",
  "PA": "Packung",
  "PG": "Packung",
  "PK": "Paket",
  "PT": "Portion",
  "PL": "palette",
  "PH": "Phiole",
  "PO": "Portionen",
  "RG": "Riegel",
  "RL": "Rolle",
  "SA": "Sack",
  "SH": "Schachtel",
  "SC": "Schale",
  "SE": "Set",
  "SO": "Sortiment",
  "SP": "Spray",
  "SG": "Stange",
  "ST": "Stück",
  "TF": "Tafel",
  "TA": "Tasse",
  "TLG": "Teile",
  "TEL": "Teller",
  "TG": "Tiegel",
  "TO": "Topf",
  "TP": "Topf",
  "TB": "Tube",
  "TU": "Tube",
  "WG": "Waschgänge",
  "WA": "Waschgänge",
  "W": "Watt",
  "WE": "Wecken",
  "WF": "Würfel",
  "ZO": "Zopf"
};

export function translateUnits(unitString, translations) {
  if(!unitString) return unitString;
  if (typeof translations == 'object') translations = Object.assign(standardUnitTranslations, translations);
  else translations = standardUnitTranslations; // translations == true --> use standards
  Object.keys(translations).forEach(originalString => {
    const replacedString = translations[originalString];
    unitString = unitString.replace(new RegExp(`(^|\\s|/|\\()(${originalString})($|\\)|\\s)`, 'g'), `$1${replacedString}$3`);
  });
  return unitString;
}

// https://stackoverflow.com/questions/13911053/regular-expression-to-match-all-words-in-a-query-in-any-order
export function matchAllWordsRegex(words) {
  if(typeof words == 'string') words = words.split(' ');
  let regExStr = words.map(word => {
    // https://stackoverflow.com/questions/3115150/how-to-escape-regular-expression-special-characters-using-javascript
    word = word.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    // word = word.replace(/\(|\)|\[|\]/g,'');
    return `(?=.*${word})`;
  }).join('');
  regExStr += '.+';
  try {
    return new RegExp(regExStr, 'i');
  } catch(err) {
    return words
  }
}

// https://stackoverflow.com/a/2901136/1267447
export function formatNumber(number, decimals = 0, dec_point = ',', thousands_sep = '.') {
  var n = !isFinite(+number) ? 0 : +number,
    prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
    sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
    dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
    toFixedFix = function (n, prec) {
      // Fix for IE parseFloat(0.55).toFixed(0) = 0;
      var k = Math.pow(10, prec);
      return Math.round(n * k) / k;
    },
    s = (prec ? toFixedFix(n, prec) : Math.round(n)).toString().split('.');
  if (s[0].length > 3) {
    s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
  }
  if ((s[1] || '').length < prec) {
    s[1] = s[1] || '';
    s[1] += new Array(prec - s[1].length + 1).join('0');
  }
  return s.join(dec);
}

export function getPrice(params) {
  let { item, listItem, amount, unit, user, group, groupSettings, userSettings, supplier, supplierSettings, singleUnitPrices, priceLogic, returnPrices } = params;
	if(!item && listItem.item) item = listItem.item;
  if(!user && typeof Meteor.user == 'function') user = Meteor.user();
  if(!group && supplier) group = Groups.findOne({ supplierId: supplier._id, 'users.userId': user._id });
	if(!unit) unit = (listItem && listItem.unit) || null;
	if(typeof amount == 'undefined' && listItem) {
		if(listItem.amount) amount = listItem.amount;
		else if(listItem.item_amount) amount = listItem.item_amount;
  }
  if(!supplierSettings) supplierSettings = {};
	// parse amount
	if(typeof amount == 'string') amount = parseFloat(amount);

  let unitAlias = null;
  if (typeof unit == 'string') unitAlias = unit;
  else if (typeof unit == 'object' && unit && unit.alias) unitAlias = unit.alias;

  let supplierId = item.supplier_id;
  if(typeof groupSettings == 'undefined' && group) groupSettings = group.settings;
	// if(typeof userSettings == 'undefined' && supplierId) userSettings = user.profile.suppliers[supplierId];
  // if(typeof singleUnitPrices == 'undefined' && groupSettings) singleUnitPrices = groupSettings.singleUnitPrices;
  if(typeof singleUnitPrices == 'undefined' && supplierSettings && supplierSettings.singleUnitPrices) singleUnitPrices = supplierSettings.singleUnitPrices;
  if(typeof priceLogic == 'undefined' && supplierSettings.priceLogic) priceLogic = supplierSettings.priceLogic;
	
  let singlePrice = null, totalPrice = 0;

  if (item.units && item.units.length > 0 && unitAlias) {
    unit = _.find(item.units, { alias: unitAlias });
  } else if (item.unit) {
    unit = item.unit;
  }
  
  let isSpecial = false;
	if(item.prices && item.prices.length > 0) {
		let defaultPrice = null, priceGroupPrice = null, groupPrice = null, actualPrice = null;
	  item.prices.forEach(price => {
			if(!price.priceGroupId && !price.groupId && (!groupSettings || groupSettings.showPrices !== 'onlyUserPrices')) defaultPrice = price.priceInfo;
			if(price.priceGroupId && group && group.priceGroupId == price.priceGroupId) { priceGroupPrice = price.priceInfo; isSpecial = true; }
			if(price.groupId && group && price.groupId == group._id) { groupPrice = price.priceInfo; isSpecial = true; }
		});
		// iterate over available prices and show the most significant one if available
    let availablePrices = ([ groupPrice, priceGroupPrice, defaultPrice ]).filter(price => !!price);
    // sort from low to high
    if(priceLogic == 'lowest' || (item && item.meta && item.meta.promo == true)) {
      availablePrices = availablePrices.sort((a, b) => {
        const prices = [];
        [a, b].forEach((priceInfo, index) => {
          if(typeof priceInfo == 'number') {
            return prices[index] = priceInfo;
          }
          else if(typeof priceInfo == 'object' && unitAlias && priceInfo[unitAlias]) {
            return prices[index] = priceInfo[unitAlias];
          }
        });
        return prices[0] - prices[1];
      });
    }
    if(returnPrices == true) {
      return availablePrices;
    }
    // find price from array  
    availablePrices.some(priceInfo => {
      if(typeof priceInfo == 'number') {
        singlePrice = priceInfo;
        return true;
      }
      else if(typeof priceInfo == 'object' && unitAlias && priceInfo[unitAlias]) {
        singlePrice = priceInfo[unitAlias];
        return true;
      }
    });
  }
  // OLD:
  else if (unit && unit.price) singlePrice = unit.price;
  else if (item.price) singlePrice = item.price;
  else singlePrice = null;

  if (singlePrice && typeof amount == 'number') {
    totalPrice = singlePrice * amount;
    if (singleUnitPrices) {
      if (item.unit && item.unit.itemcount) totalPrice = singlePrice * amount * item.unit.itemcount;
      if (item.units && item.units.length > 0 && unit && unit.itemcount > 0) {
        totalPrice = singlePrice * amount * unit.itemcount;
      }
    }
  }

  if (singlePrice == null && !totalPrice) totalPrice = null;
  totalPrice = typeof totalPrice == 'number' ? Math.round(totalPrice * 1000) / 1000 : null;
  singlePrice = typeof singlePrice == 'number' ? Math.round(singlePrice * 1000) / 1000 : null;

  return { singlePrice, totalPrice, isSpecial }
}

export function getUnitName({ unit, supplierSettings }) {
  let hasSingleUnit = typeof unit.itemcount == 'number' && unit.itemcount !== 1 && (!unit.singleunit || unit.singleunit !== unit.name);
  let name = unit.name;
  if(unit.suffix) unit.suffix = unit.suffix.replace(unit.name, '').trim();
  if(!hasSingleUnit && unit.suffix) name += (' ' + unit.suffix);
  else if(hasSingleUnit && unit.suffix) name += ` (${unit.itemcount} x ${unit.suffix || ''})`;
  else if(hasSingleUnit && !unit.suffix) name += ` (${unit.itemcount} ${unit.singleunit || 'x'})`;
  if(supplierSettings && supplierSettings.translateUnits) name = translateUnits(name, supplierSettings.translateUnits);
  return name;
}

export function getEmailAddress(user, options = {}) {
  const { specialSupplierOrderEmail } = options;
  if (typeof user == 'string') user = Meteor.users.findOne({ _id: user }); // id given
  if (!user) return null;
  
  if (specialSupplierOrderEmail && specialSupplierOrderEmail.address) {
    let supplier_email = (user.emails && user.emails[0] && user.emails[0].address) || null;    
    const specialOrderAddress = specialSupplierOrderEmail.address.split(';').map(add => add.trim());
    if(specialSupplierOrderEmail.overwrite == true) supplier_email = [ ...specialOrderAddress ];
    else supplier_email = [ supplier_email, ...specialOrderAddress ];
    return supplier_email.filter(email => !!email);
  }

  if (user.emails && user.emails[0] && user.emails[0].address) return user.emails[0].address;
  let emails = [];
  if (user.profile && user.profile.company && user.profile.company.email) emails.push(user.profile.company.email);
  let parents = Meteor.users.find({ 'internal.childrenIds': user._id }).fetch();
  let parentCompanyEmail = null;
  if (parents && parents.length > 0) {
    parents.forEach(parent => {
      if (parent.emails && parent.emails[0] && parent.emails[0].address) emails.push(parent.emails[0].address);
      if (!parentCompanyEmail && parent.profile && parent.profile.company && parent.profile.company.email) parentCompanyEmail = parent.profile.company.email;
    });
  }
  if (emails.length > 0) return _.uniq(emails);
  if (emails.length == 0 && parentCompanyEmail) return parentCompanyEmail;
  return null;
}