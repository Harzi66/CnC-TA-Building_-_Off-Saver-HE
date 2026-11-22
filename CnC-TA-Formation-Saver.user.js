// ==UserScript==
// @name           CnC-TA-Formation-Saver
// @description    Allows you to save attack formations
// @namespace      https://prodgame*.alliances.commandandconquer.com/*/index.aspx*
// @match          https://*.alliances.commandandconquer.com/*/index.aspx*
// @version        2.3.22
// @author         Panavia, KRS_L, DebitoSphere
// @downloadURL    https://raw.githubusercontent.com/Harzi66/CnC-TA-Building_-_Off-Saver-HE/main/CnC-TA-Formation-Saver.user.js
// @updateURL      https://raw.githubusercontent.com/Harzi66/CnC-TA-Building_-_Off-Saver-HE/main/CnC-TA-Formation-Saver.user.js
// ==/UserScript==
(function (){
    var tafs_main = function() {
        var windowSaver;

        function initialize() {
            console.log("Formation Saver Loaded");

            qx.Class.define("webfrontend.gui.PlayArea.FormationSaver", {
                extend: qx.ui.container.Composite,

                construct:function() {
                    qx.ui.container.Composite.call(this);
                    this.setLayout(new qx.ui.layout.Canvas());
                    this.add(this.init());
                },

                statics: {
                    SaverCollapsedHeight: 32,
                    SaverExpandedHeight: 245,
                },

                properties: {
                    expanded: {init: true, apply: "expand"},
                },

                members: {
                    buttonResize: null,
                    containerContence: null,
                    containerSaves: null,
                    containerMain: null,
                    buttonSave: null,
                    optionsWindow: null,
                    highlightSettings: null,

                    init: function() {
                        var Y = 6;
                        this.buttonResize = new webfrontend.ui.SoundButton(null, "FactionUI/icons/icon_tracker_minimise.png").set({width: 20, height: 20, appearance: "button-notif-cat", center: true, allowGrowX: false});
                        this.buttonResize.addListener("click",function(e) {
                            this.setExpanded(!this.getExpanded());
                        }, this);
                        var ba = new qx.ui.container.Composite(new qx.ui.layout.HBox().set({alignY:"middle"})).set({margin:Y,marginRight:Y+3});
                        ba.add(this.buttonResize);
                        var labelTitle = new qx.ui.basic.Label("<b>Saver</b>");
                        labelTitle.set({marginLeft: 4, rich: true});
                        labelTitle.setTextColor("#FFFFFF");
                        ba.add(labelTitle);
                        this.containerContence = new qx.ui.container.Composite(new qx.ui.layout.VBox().set({alignX:"center"})).set({allowGrowX:true,marginTop:0,marginBottom:5});

                        containerSaves = new qx.ui.container.Composite(new qx.ui.layout.Grid(10, 2)).set({allowGrowX: true , marginLeft: 0, marginBottom: 5});
                        this.containerContence.add(containerSaves);

                        buttonSave = new qx.ui.form.Button("Save");
                        buttonSave.set({width: 50, appearance: "button-text-small", toolTipText: "Save attack formation", allowGrowX:false});
                        buttonSave.addListener("click", this.save, this);
                        // Right-click opens settings; the normal left-click save action stays unchanged.
                        buttonSave.addListener("contextmenu", function(e) {
                            if (e && e.preventDefault) e.preventDefault();
                            this.openOptions();
                        }, this);
                        this.containerContence.add(buttonSave);

                        this.loadHighlightSettings();
                        this.createOptionsWindow();

                        this.containerMain=new qx.ui.container.Composite(new qx.ui.layout.VBox().set({alignX:"right"})).set({maxHeight:webfrontend.gui.PlayArea.FormationSaver.SaverExpandedHeight,width:75,minHeight:32,allowShrinkY:true});
                        this.containerMain.add(ba);
                        this.containerMain.add(this.containerContence,{flex:1});

                        return this.containerMain;


                    },

                    expand: function(bs) {
                        if(!bs) {
                            this.buttonResize.setIcon("FactionUI/icons/icon_tracker_maximise.png");
                            this.containerMain.setMaxHeight(webfrontend.gui.PlayArea.FormationSaver.SaverCollapsedHeight);
                        } else {
                            this.buttonResize.setIcon("FactionUI/icons/icon_tracker_minimise.png");
                            this.containerMain.setMaxHeight(webfrontend.gui.PlayArea.FormationSaver.SaverExpandedHeight);
                        }
                    },

                    update: function() {
                        containerSaves.removeAll();

                        var playerCities = ClientLib.Data.MainData.GetInstance().get_Cities();
                        var currentOwnCity = playerCities.get_CurrentOwnCity();
                        var cityID = playerCities.get_CurrentCity().get_Id();
                        var ownCityID = currentOwnCity.get_Id();

                        var formations = this.loadFormations();
                        if(!formations) {
                            return;
                        }
                        if(!formations[cityID]) {
                            return;
                        }
                        if(!formations[cityID][ownCityID]) {
                            return;
                        }

                        var i = 0;
                        for(var id in formations[cityID][ownCityID]) {
                            if(id != 0) {
                                i++;
                                var formation = formations[cityID][ownCityID][id];
                                var date = new Date(Number(formation.t));
                                var toolTipText = "<div><span style='float: left'><b>" + formation.n + "</b></span><span style='float: right'>&nbsp;&nbsp;&nbsp;&nbsp;" + date.getHours() + ":" + (date.getMinutes() <= 9 ? "0" : "") + date.getMinutes() + " " + date.getDate() + "/" + (date.getMonth() + 1) + "</span></div><div style='clear: both;'></div>";
                                if(formation.cy != null) {
                                    toolTipText += formation.cy + "% Construction Yard</br>" + formation.df + "% Defense Facility</br>" + formation.ts + "% Troop Strength</br>" + this.formatSecondsAsTime(formation.r) + " Repair Time";
                                }

                                var labelLoad = new qx.ui.basic.Label(formation.n);
                                labelLoad.set({width: 40, allowGrowX: false, toolTipText: toolTipText});
                                labelLoad.setTextColor("#FFFFFF");
                                labelLoad.addListener("click", this.clickLoad(formation), this);
                                labelLoad.addListener("mouseover", this.mouseover(labelLoad, "#BBBBBB"), this);
                                labelLoad.addListener("mouseout", this.mouseout(labelLoad, "#FFFFFF"), this);
                                containerSaves.add(labelLoad, {row: i, column: 1});

                                var labelDelete = new qx.ui.basic.Label("<b>X</b>");
                                labelDelete.set({width: 10, allowGrowX:false, rich: true, toolTipText: "Delete " + formation.n});
                                labelDelete.setTextColor("#881717");
                                labelDelete.addListener("click", this.clickDeleteF(cityID, ownCityID, id), this);
                                labelDelete.addListener("mouseover", this.mouseover(labelDelete, "#550909"), this);
                                labelDelete.addListener("mouseout", this.mouseover(labelDelete, "#881717"), this);
                                containerSaves.add(labelDelete, {row: i, column: 2});
                            }
                        }
                    },

                    mouseover: function(label, color) {
                        return function() {
                            label.setTextColor(color);
                        }
                    },

                    mouseout: function(label, color) {
                        return function() {
                            label.setTextColor(color);
                        }
                    },

                    save: function() {
                        try {
                            var playerCities = ClientLib.Data.MainData.GetInstance().get_Cities();
                            var currentOwnCity = playerCities.get_CurrentOwnCity();
                            var cityID = playerCities.get_CurrentCity().get_Id();
                            var ownCityID = currentOwnCity.get_Id();

                            var newFormation = new Object();
                            newFormation.t = new Date().getTime().toString();
                            newFormation.n = "";
                            newFormation.l = new Array();

                            var formation = currentOwnCity.get_CityArmyFormationsManager().GetFormationByTargetBaseId(cityID);
                            var armyUnits = formation.get_ArmyUnits();
                            if(armyUnits == null) {
                                console.log("tafs Error: You must move a unit befor saving!");
                                return;
                            }
                            armyUnits = armyUnits.l;
                            for(var i in armyUnits)
                            {
                                var unit = armyUnits[i];
                                newFormation.l[i] = new Object();
                                newFormation.l[i].x = unit.get_CoordX();
                                newFormation.l[i].y = unit.get_CoordY();
                                newFormation.l[i].e = unit.get_Enabled();
                            }

                            var formations = this.loadFormations();
                            if(!formations) {
                                formations = new Object();
                            }
                            if(!formations[cityID]) {
                                formations[cityID] = new Object();
                            }
                            if(!formations[cityID][ownCityID]) {
                                formations[cityID][ownCityID] = new Array();
                                formations[cityID][ownCityID][0] = 0;
                            }
                            formations[cityID][ownCityID][0]++;
                            newFormation.n = "Save " + formations[cityID][ownCityID][0];

                            formations[cityID][ownCityID].push(newFormation);
                            this.saveFormations(formations);

                            windowSaver.update();
                        } catch(e) {
                            console.log(e);
                        }
                    },

                    clickLoad: function(newFormation) {
                        return function() {
                            this.load(newFormation);
                        }
                    },

                    load: function(newFormation) {
                        try {
                            var playerCities = ClientLib.Data.MainData.GetInstance().get_Cities();
                            var currentOwnCity = playerCities.get_CurrentOwnCity();
                            var cityID = playerCities.get_CurrentCity().get_Id();

                            var formation = currentOwnCity.get_CityArmyFormationsManager().GetFormationByTargetBaseId(cityID);
                            var armyUnits = formation.get_ArmyUnits();
                            if(armyUnits == null) {
                                console.log("tafs Error: You must move a unit befor loading!");
                                return;
                            }
                            armyUnits = armyUnits.l;

                            for(var i in newFormation.l)
                            {
                                var unitData = newFormation.l[i];
                                armyUnits[i].MoveBattleUnit(unitData.x, unitData.y);
                                if(unitData.e != null) {
                                    if(armyUnits[i].set_Enabled_Original) {
                                        armyUnits[i].set_Enabled_Original(unitData.e);
                                    } else {
                                        armyUnits[i].set_Enabled(unitData.e);
                                    }
                                }
                            }

                            //formation.set_CurrentTargetBaseId(cityID);
                        } catch(e) {
                            console.log(e);
                        }
                    },

                    clickDeleteF: function(cityID, ownCityID, id) {
                        return function() {
                            this.deleteF(cityID, ownCityID, id);
                        }
                    },

                    deleteF: function(cityID, ownCityID, id) {
                        var formations = this.loadFormations();
                        if(!formations || !formations[cityID] || !formations[cityID][ownCityID])
                            return;

                        formations[cityID][ownCityID].splice(id, 1);
                        if(formations[cityID][ownCityID].length <= 1) {
                            delete formations[cityID][ownCityID];
                        }
                        var i
                        for(i in formations[cityID]) {
                            if(formations[cityID].hasOwnProperty(i)) {
                                break;
                            }
                        }
                        if(!i)
                            delete formations[cityID];

                        this.saveFormations(formations);

                        windowSaver.update();
                    },

                    // Persistent world-map highlighting settings (independent of TACS).
                    loadHighlightSettings: function() {
                        var defaults = { enabled: true, color: "Cyan", textColor: "#FF6600", language: "auto" };
                        try {
                            var stored = localStorage.tafs_highlight_settings;
                            this.highlightSettings = stored ? Object.assign({}, defaults, JSON.parse(stored)) : defaults;
                        } catch (e) {
                            this.highlightSettings = defaults;
                        }
                    },

                    saveHighlightSettings: function() {
                        try { localStorage.tafs_highlight_settings = JSON.stringify(this.highlightSettings); } catch (e) { console.log(e); }
                    },

                    getLanguage: function() {
                        var choice = this.highlightSettings ? this.highlightSettings.language : "auto";
                        var lang = choice;
                        if (lang === "auto") {
                            lang = (document.documentElement && document.documentElement.lang) || (navigator.language || "de");
                        }
                        lang = String(lang).toLowerCase().substring(0, 2);
                        return (lang === "en" || lang === "es" || lang === "fr") ? lang : "de";
                    },

                    tr: function(key) {
                        var dict = {
                            de: { title:"Formation-Saver", enabled:"Markierung aktiv", color:"Farbauswahl Hintergrund", textColor:"Farbe Schrift", language:"Sprachauswahl", automatic:"Automatisch", cyan:"Hellblau", orange:"Orange", blue:"Blau", white:"Weiß", red:"Rot", yellow:"Gelb", green:"Grün", purple:"Violett", pink:"Pink", magenta:"Magenta", lime:"Limette", teal:"Petrol", brown:"Braun", gray:"Grau", navy:"Marineblau", close:"Schließen", info:"Gespeicherte Ziele werden markiert." },
                            en: { title:"Formation Saver", enabled:"Highlighting active", color:"Background color", textColor:"Text color", language:"Language selection", automatic:"Automatic", cyan:"Light blue", orange:"Orange", blue:"Blue", white:"White", red:"Red", yellow:"Yellow", green:"Green", purple:"Purple", pink:"Pink", magenta:"Magenta", lime:"Lime", teal:"Teal", brown:"Brown", gray:"Gray", navy:"Navy", close:"Close", info:"Marks targets with saved formations." },
                            es: { title:"Formation Saver", enabled:"Resaltado activo", color:"Color de fondo", textColor:"Color del texto", language:"Selección de idioma", automatic:"Automático", cyan:"Azul claro", orange:"Naranja", blue:"Azul", white:"Blanco", red:"Rojo", yellow:"Amarillo", green:"Verde", purple:"Violeta", pink:"Rosa", magenta:"Magenta", lime:"Lima", teal:"Verde azulado", brown:"Marrón", gray:"Gris", navy:"Azul marino", close:"Cerrar", info:"Marca objetivos con formaciones guardadas." },
                            fr: { title:"Formation Saver", enabled:"Marquage actif", color:"Couleur d’arrière-plan", textColor:"Couleur du texte", language:"Choix de la langue", automatic:"Automatique", cyan:"Bleu clair", orange:"Orange", blue:"Bleu", white:"Blanc", red:"Rouge", yellow:"Jaune", green:"Vert", purple:"Violet", pink:"Rose", magenta:"Magenta", lime:"Citron vert", teal:"Sarcelle", brown:"Marron", gray:"Gris", navy:"Bleu marine", close:"Fermer", info:"Marque les cibles avec formations sauvegardées." }
                        };
                        return dict[this.getLanguage()][key] || key;
                    },

                    createOptionsWindow: function() {
                        var self = this;
                        this.optionsWindow = new qx.ui.window.Window(this.tr("title"), "FactionUI/icons/icon_forum_properties.png").set({
                            width: 190, height: 315, showMaximize: false, showMinimize: false,
                            allowMaximize: false, allowMinimize: false, resizable: false,
                            contentPadding: 7, opacity: 1, backgroundColor: "#000000"
                        });
                        this.optionsWindow.setLayout(new qx.ui.layout.VBox(7));
                        this.optionsWindow.setBackgroundColor("#000000");
                        try {
                            this.optionsWindow.getChildControl("pane").setBackgroundColor("#000000");
                            this.optionsWindow.getChildControl("content").setBackgroundColor("#000000");
                        } catch (e) {}
                        this.optionsWindow.getChildControl("icon").set({ scale: true, width: 20, height: 20 });

                        var enabled = new qx.ui.form.CheckBox(this.tr("enabled")).set({
                            textColor:"#FFFFFF", font:"small", width:170, allowGrowX:false
                        });
                        enabled.setValue(!!this.highlightSettings.enabled);
                        enabled.addListener("changeValue", function(e) {
                            self.highlightSettings.enabled = e.getData();
                            self.saveHighlightSettings();
                            self.refreshMapHighlighting();
                            self.applyCityTextColor();
                        });
                        this.optionsWindow.add(enabled);

                        // Stacked labels keep every caption readable in the narrow window.
                        var colorLabel = new qx.ui.basic.Label(this.tr("color")).set({
                            textColor:"#FFFFFF", font:"small", width:170, allowGrowX:false
                        });
                        this.optionsWindow.add(colorLabel);
                        var colors = new qx.ui.form.SelectBox().set({
                            width:170, textColor:"#FFFFFF", allowGrowX:false
                        });
                        // Read the game's actual background-plate palette instead of guessing enum names.
                        // This exposes up to 15 distinct colors supported by the running game client.
                        var bgEnum = ClientLib.Vis.EBackgroundPlateColor || {};
                        var bgKeys = Object.keys(bgEnum).filter(function(key) {
                            return !/^\d+$/.test(key) && typeof bgEnum[key] === "number";
                        });
                        bgKeys.sort(function(a, b) {
                            if (a === "Cyan") return -1;
                            if (b === "Cyan") return 1;
                            return a.localeCompare(b);
                        });
                        bgKeys.slice(0, 15).forEach(function(key) {
                            var translationKey = key.charAt(0).toLowerCase() + key.slice(1);
                            var label = self.tr(translationKey);
                            if (label === translationKey) {
                                label = key.replace(/([a-z])([A-Z])/g, "$1 $2");
                            }
                            var li = new qx.ui.form.ListItem(label, null, key);
                            colors.add(li);
                            if ((self.highlightSettings.color || "Cyan") === key) colors.setSelection([li]);
                        });
                        if (!bgKeys.length) {
                            var fallback = new qx.ui.form.ListItem(self.tr("cyan"), null, "Cyan");
                            colors.add(fallback);
                            colors.setSelection([fallback]);
                        }
                        colors.addListener("changeSelection", function(e) {
                            var selected = e.getData();
                            if (selected && selected[0]) {
                                self.highlightSettings.color = selected[0].getModel();
                                self.saveHighlightSettings();
                                self.refreshMapHighlighting();
                            }
                        });
                        this.optionsWindow.add(colors);

                        var textColorLabel = new qx.ui.basic.Label(this.tr("textColor")).set({
                            textColor:"#FFFFFF", font:"small", width:170, allowGrowX:false
                        });
                        this.optionsWindow.add(textColorLabel);
                        var textColors = new qx.ui.form.SelectBox().set({
                            width:170, textColor:"#FFFFFF", allowGrowX:false
                        });
                        [
                            ["#FFFFFF","white"],["#FF6600","orange"],["#FF0000","red"],
                            ["#FFFF00","yellow"],["#00C853","green"],["#00FFFF","cyan"],
                            ["#0080FF","blue"],["#C000FF","purple"],["#FF69B4","pink"],
                            ["#FF00FF","magenta"],["#A8E000","lime"],["#008080","teal"],
                            ["#8B4513","brown"],["#B0B0B0","gray"],["#001F5B","navy"]
                        ].forEach(function(item) {
                            var li = new qx.ui.form.ListItem(self.tr(item[1]), null, item[0]);
                            textColors.add(li);
                            if ((self.highlightSettings.textColor || "#FF6600") === item[0]) textColors.setSelection([li]);
                        });
                        textColors.addListener("changeSelection", function(e) {
                            var selected = e.getData();
                            if (selected && selected[0]) {
                                self.highlightSettings.textColor = selected[0].getModel();
                                self.saveHighlightSettings();
                                self.applyCityTextColor();
                                self.refreshMapHighlighting();
                            }
                        });
                        this.optionsWindow.add(textColors);

                        var languageLabel = new qx.ui.basic.Label(this.tr("language")).set({
                            textColor:"#FFFFFF", font:"small", width:170, allowGrowX:false
                        });
                        this.optionsWindow.add(languageLabel);
                        var languages = new qx.ui.form.SelectBox().set({
                            width:170, textColor:"#FFFFFF", allowGrowX:false
                        });
                        [["auto", "automatic"],["de","Deutsch"],["en","English"],["es","Español"],["fr","Français"]].forEach(function(item) {
                            var li = new qx.ui.form.ListItem(item[1], null, item[0]);
                            languages.add(li);
                            if (self.highlightSettings.language === item[0]) languages.setSelection([li]);
                        });
                        languages.addListener("changeSelection", function(e) {
                            var selected = e.getData();
                            if (selected && selected[0]) {
                                self.highlightSettings.language = selected[0].getModel();
                                self.saveHighlightSettings();
                                self.optionsWindow.close();
                                self.createOptionsWindow();
                                self.openOptions();
                            }
                        });
                        this.optionsWindow.add(languages);

                        var info = new qx.ui.basic.Label(this.tr("info"));
                        info.set({
                            rich:false, textColor:"#FFFFFF", font:"small",
                            width:170, maxWidth:170, allowGrowX:false, wrap:true
                        });
                        this.optionsWindow.add(info);
                        var close = new qx.ui.form.Button(this.tr("close")).set({
                            width:170, allowGrowX:false
                        });
                        close.addListener("execute", function() { self.optionsWindow.close(); });
                        this.optionsWindow.add(close, { flex: 0 });
                    },
                    closeOptions: function() {
                        if (this.optionsWindow && this.optionsWindow.isVisible()) {
                            this.optionsWindow.close();
                        }
                    },

                    openOptions: function() {
                        if (this.optionsWindow) {
                            this.optionsWindow.open();
                            this.optionsWindow.moveTo(120, 180);
                            this.optionsWindow.setAlwaysOnTop(true);
                        }
                    },

                    hasSavedFormation: function(targetCityId) {
                        try {
                            var cities = ClientLib.Data.MainData.GetInstance().get_Cities();
                            var ownCity = cities.get_CurrentOwnCity();
                            if (!ownCity) return false;
                            var formations = this.loadFormations();
                            var target = formations && formations[targetCityId];
                            var own = target && target[ownCity.get_Id()];
                            if (!own) return false;
                            // Formationen werden als Array gespeichert. Index "0" ist
                            // bereits eine gültige erste Formation und darf nicht ignoriert werden.
                            for (var key in own) {
                                if (Object.prototype.hasOwnProperty.call(own, key) && own[key] != null) return true;
                            }
                        } catch (e) { console.log(e); }
                        return false;
                    },

                    refreshMapHighlighting: function() {
                        try {
                            var vis = ClientLib.Vis.VisMain.GetInstance();
                            if (vis && typeof vis.Refresh === "function") vis.Refresh();
                            else if (vis && typeof vis.refresh === "function") vis.refresh();
                        } catch (e) {}
                    },

                    installMapHighlighting: function() {
                        var self = this;
                        var allPatched = true;

                        function patch(regionClass, isNpc) {
                            if (!regionClass || !regionClass.prototype) return false;
                            var proto = regionClass.prototype;
                            if (proto.__tafsHighlightPatched) return true;

                            // Wie TACS gezielt die Funktion finden, die die BasePlate-Farbe liefert.
                            // Wichtig: Das Flag erst setzen, wenn tatsächlich eine Funktion gefunden wurde.
                            for (var key in proto) {
                                if (typeof proto[key] !== "function") continue;
                                var source;
                                try { source = proto[key].toString(); } catch (e) { continue; }
                                if (source.indexOf("Blue") === -1 || source.indexOf("Black") === -1) continue;

                                proto[key] = (function(npc) {
                                    return function() {
                                        var base = ClientLib.Vis.EBackgroundPlateColor.Black;
                                        var hasFormation = false;
                                        try {
                                            hasFormation = !!(self.highlightSettings &&
                                                self.highlightSettings.enabled &&
                                                typeof this.get_Id === "function" &&
                                                self.hasSavedFormation(this.get_Id()));
                                        } catch (e) {}

                                        if (!npc && typeof this.get_Type === "function" &&
                                            this.get_Type() === ClientLib.Vis.Region.RegionCity.ERegionCityType.Own) {
                                            base = (this.get_PlayerFaction && this.get_PlayerFaction() === 1)
                                                ? ClientLib.Vis.EBackgroundPlateColor.Cyan
                                                : ClientLib.Vis.EBackgroundPlateColor.Orange;
                                        } else if (hasFormation) {
                                            var selected = self.highlightSettings.color || "Cyan";
                                            base = ClientLib.Vis.EBackgroundPlateColor[selected] ||
                                                ClientLib.Vis.EBackgroundPlateColor.Cyan;
                                        }
                                        return base;
                                    };
                                })(isNpc);

                                proto.__tafsHighlightPatched = true;
                                console.log("Formation Saver: BasePlate-Markierung installiert", regionClass.name || "Region", key);
                                return true;
                            }

                            return false;
                        }

                        try {
                            allPatched = patch(ClientLib.Vis.Region.RegionCity, false) && allPatched;
                            allPatched = patch(ClientLib.Vis.Region.RegionNPCCamp, true) && allPatched;
                            allPatched = patch(ClientLib.Vis.Region.RegionNPCBase, true) && allPatched;
                        } catch (e) {
                            allPatched = false;
                            console.log("Formation Saver map highlighting:", e);
                        }

                        // ClientLib kann die Region-Prototypen verzögert vollständig bereitstellen.
                        // Fehlende Patches werden erneut gesucht, statt sie fälschlich als erledigt zu markieren.
                        if (!allPatched && !this.__tafsMapHighlightRetryPending && !this.__tafsMapHighlightRetryExpired) {
                            this.__tafsMapHighlightRetryPending = true;
                            var attempts = 0;
                            var retry = function() {
                                attempts++;
                                self.__tafsMapHighlightRetryPending = false;
                                self.installMapHighlighting();
                                if (self.__tafsMapHighlightRetryPending) return;

                                var cityDone = ClientLib.Vis.Region.RegionCity.prototype.__tafsHighlightPatched;
                                var campDone = ClientLib.Vis.Region.RegionNPCCamp.prototype.__tafsHighlightPatched;
                                var baseDone = ClientLib.Vis.Region.RegionNPCBase.prototype.__tafsHighlightPatched;
                                if (cityDone && campDone && baseDone) return;

                                if (attempts >= 120) {
                                    self.__tafsMapHighlightRetryExpired = true;
                                    console.warn("Formation Saver: BasePlate-Funktion nicht in allen Region-Typen gefunden.");
                                    return;
                                }
                                self.__tafsMapHighlightRetryPending = true;
                                window.setTimeout(retry, 500);
                            };
                            window.setTimeout(retry, 500);
                        }
                    },

                    applyCityTextColor: function() {
                        var self = this;
                        try {
                            var regionClass = ClientLib.Vis.Region.RegionCity;
                            var proto = regionClass && regionClass.prototype;
                            if (!proto || typeof proto.LEDPWB !== "function") {
                                console.warn("Formation Saver: City text setter LEDPWB not found.");
                                return;
                            }

                            // CityOnlineStateColorer analysiert den Original-Quelltext von LEDPWB.
                            // Deshalb erst umwickeln, nachdem der Colorer seine Ersatzfunktion installiert hat.
                            var colorerInstalled = typeof proto.SetCanvasValue_FIXED === "function" &&
                                proto.LEDPWB === proto.SetCanvasValue_FIXED;

                            if (!colorerInstalled && !proto.__tafsTextColorPatched && !proto.__tafsTextColorWaitExpired) {
                                if (!proto.__tafsTextColorPending) {
                                    proto.__tafsTextColorPending = true;
                                    var attempts = 0;
                                    var waitForColorer = function() {
                                        attempts++;
                                        var currentProto = regionClass && regionClass.prototype;
                                        var ready = currentProto &&
                                            typeof currentProto.LEDPWB === "function" &&
                                            typeof currentProto.SetCanvasValue_FIXED === "function" &&
                                            currentProto.LEDPWB === currentProto.SetCanvasValue_FIXED;

                                        // Der Colorer startet verzögert (30 Sekunden nach ClientLib).
                                        // Ohne Colorer erfolgt nach 60 Sekunden ein Fallback auf den vorhandenen Setter.
                                        if (ready || attempts >= 120) {
                                            currentProto.__tafsTextColorPending = false;
                                            if (!ready) currentProto.__tafsTextColorWaitExpired = true;
                                            self.applyCityTextColor();
                                        } else {
                                            window.setTimeout(waitForColorer, 500);
                                        }
                                    };
                                    window.setTimeout(waitForColorer, 500);
                                }
                                this.refreshMapHighlighting();
                                return;
                            }

                            if (proto.__tafsTextColorPatched) {
                                this.refreshMapHighlighting();
                                return;
                            }

                            var original = proto.LEDPWB;
                            var wrapped = function() {
                                // Erst CityColorer bzw. Spiel-Logik ausführen, danach Formation-Farbe.
                                var result = original.apply(this, arguments);
                                try {
                                    if (!self.highlightSettings || !self.highlightSettings.enabled) return result;
                                    var cityType = this.get_Type ? this.get_Type() : null;
                                    var types = regionClass.ERegionCityType;
                                    // Eigene Städte und Allianzbasen behalten die nativen Spielfarben.
                                    if (types && (cityType === types.Own || cityType === types.Alliance)) return result;
                                    // Nur Ziele einfärben, für die eine Formation der aktuellen eigenen Stadt existiert.
                                    if (!self.hasSavedFormation(this.get_Id())) return result;
                                    var selectedTextColor = self.highlightSettings.textColor || "#FF6600";
                                    var changed = false;
                                    ["EWURCB", "AWDREQ", "LMHVYU"].forEach(function(key) {
                                        var label = this[key];
                                        if (label && label.Color !== selectedTextColor) {
                                            label.Color = selectedTextColor;
                                            changed = true;
                                        }
                                    }, this);
                                    if (changed && this.KVDNWI && typeof this.KVDNWI.SHDYIC === "function") {
                                        this.KVDNWI.SHDYIC();
                                    }
                                } catch (e) {
                                    console.log("Formation Saver city text color:", e);
                                }
                                return result;
                            };
                            wrapped.__tafsTextColorWrapper = true;
                            proto.LEDPWB = wrapped;
                            proto.__tafsTextColorPatched = true;
                            this.refreshMapHighlighting();
                        } catch (e) {
                            console.log("Formation Saver city text color:", e);
                        }
                    },

                    saveFormations: function(formations) {
                        var data = JSON.stringify(formations);
                        localStorage.formations = data;
                    },

                    loadFormations: function() {
                        var formations = localStorage.formations;
                        return formations && JSON.parse(formations);
                    },

                    formatSecondsAsTime: function(secs, format) {
                        var hr = Math.floor(secs / 3600);
                        var min = Math.floor((secs - (hr * 3600)) / 60);
                        var sec = Math.floor(secs - (hr * 3600) - (min * 60));

                        if(hr < 10) {
                            hr = "0" + hr;
                        }
                        if(min < 10) {
                            min = "0" + min;
                        }
                        if(sec < 10) {
                            sec = "0" + sec;
                        }

                        return hr + ':' + min + ':' + sec;
                    },
                }
            })

            windowSaver = new webfrontend.gui.PlayArea.FormationSaver();
            windowSaver.installMapHighlighting();
            windowSaver.applyCityTextColor();
            windowSaver.hide();
            qx.core.Init.getApplication().getPlayArea().add(windowSaver, {top: 225, left: -2});

            if(!ClientLib.Data.MainData.GetInstance().get_Cities().__tafs__set_CurrentOwnCityId) {
                ClientLib.Data.MainData.GetInstance().get_Cities().__tafs__set_CurrentOwnCityId = ClientLib.Data.MainData.GetInstance().get_Cities().set_CurrentOwnCityId;
            }
            ClientLib.Data.MainData.GetInstance().get_Cities().set_CurrentOwnCityId = function(a) {
                this.__tafs__set_CurrentOwnCityId(a);
                windowSaver.closeOptions();
                updateView();
            }

            if(!ClientLib.Data.MainData.GetInstance().get_Cities().__tafs__set_CurrentCityId) {
                ClientLib.Data.MainData.GetInstance().get_Cities().__tafs__set_CurrentCityId = ClientLib.Data.MainData.GetInstance().get_Cities().set_CurrentCityId;
            }
            ClientLib.Data.MainData.GetInstance().get_Cities().set_CurrentCityId = function(a) {
                this.__tafs__set_CurrentCityId(a);
                windowSaver.closeOptions();
                updateView();
            }

            function updateView() {
                if (PerforceChangelist >= 376877) {
                    switch(qx.core.Init.getApplication().getPlayArea().getViewMode()) {
                        case ClientLib.Data.PlayerAreaViewMode.pavmCombatSetupDefense:
                        case ClientLib.Data.PlayerAreaViewMode.pavmCombatSetupBase:
                            windowSaver.update();
                            windowSaver.show();
                            break;
                        default:
                            windowSaver.closeOptions();
                            windowSaver.hide();
                    }
                } else {
                    switch(qx.core.Init.getApplication().getPlayArea().getViewMode()) {
                        case webfrontend.gui.PlayArea.PlayArea.modes.EMode_CombatSetupDefense:
                        case webfrontend.gui.PlayArea.PlayArea.modes.EMode_CombatSetupBase:
                            windowSaver.update();
                            windowSaver.show();
                            break;
                        default:
                            windowSaver.closeOptions();
                            windowSaver.hide();
                    }
                }
            }
        }

        function tafs_checkIfLoaded() {
            try {
                if (typeof qx != 'undefined') {
                    a = qx.core.Init.getApplication(); // application
                    mb = qx.core.Init.getApplication().getMenuBar();
                    if (a && mb) {
                        initialize();
                    } else
                        window.setTimeout(tafs_checkIfLoaded, 1000);
                } else {
                    window.setTimeout(tafs_checkIfLoaded, 1000);
                }
            } catch (e) {
                if (typeof console != 'undefined') console.log(e);
                else if (window.opera) opera.postError(e);
                else GM_log(e);
            }
        }

        if (/commandandconquer\.com/i.test(document.domain)) {
            window.setTimeout(tafs_checkIfLoaded, 1000);
        }
    }

    // injecting, because there seem to be problems when creating game interface with unsafeWindow
    var tafsScript = document.createElement("script");
    tafsScript.innerHTML = "(" + tafs_main.toString() + ")();";
    tafsScript.type = "text/javascript";
    if (/commandandconquer\.com/i.test(document.domain)) {
        document.getElementsByTagName("head")[0].appendChild(tafsScript);
    }
})();

