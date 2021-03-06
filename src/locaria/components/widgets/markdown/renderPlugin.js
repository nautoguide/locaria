import React from 'react';
import TopFeatures from "../search/topFeatures";
import PageList from "../pages/pageList";
import ContactFull from "../contact/contactFull";
import FooterTypeSimple from "../footers/footerTypeSimple";
import NavTypeSimple from "../navs/navTypeSimple";
import SiteMap from "../pages/siteMap";
import LogoStrapLine from "../logos/logoStrapLine";
import ViewFullDetails from "../viewLayouts/viewFullDetails";
import TextSearchWidget from "../search/textSearchWidget";
import SocialIcons from "../social/socialIcons";
import SlideShow from "../images/slideShow";
import ContactMailchimp from "../contact/contactMailchimp";
import NavButton from "../navs/navButton";

export default function RenderPlugin({plugin}) {

	const pluginMatch = plugin.match(/^([a-zA-Z]*)\s{0,1}/);

	let pluginId = pluginMatch[1];
	let pluginArgStr = plugin.replace(pluginMatch[0], '');

	const plugins = {
		"TopFeatures": TopFeatures,
		"PageList": PageList,
		"ContactFull": ContactFull,
		"ContactMailchimp": ContactMailchimp,
		"FooterTypeSimple": FooterTypeSimple,
		"NavTypeSimple": NavTypeSimple,
		"SiteMap": SiteMap,
		"LogoStrapLine": LogoStrapLine,
		"ViewFullDetails": ViewFullDetails,
		"TextSearchWidget": TextSearchWidget,
		"SocialIcons": SocialIcons,
		"SlideShow": SlideShow,
		"NavButton": NavButton
	}


	if (plugins[pluginId]) {
		let PluginComponent = plugins[pluginId];
		let matchArgs = pluginArgStr.match(/(?:[^\s"]+|"[^"]*")+/g);
		let pluginArgs = {};
		for (let a in matchArgs) {
			let cmdArray = matchArgs[a].split(/^([a-zA-Z]+)(=)/);
			if(cmdArray[3]) {
				let evalCmd = cmdArray[3].replace(/\\"/, '"');
				try {
					pluginArgs[cmdArray[1]] = eval(JSON.parse(evalCmd));
				} catch (e) {
					pluginArgs[cmdArray[1]] = eval(evalCmd);

				}
			} else {
				pluginArgs[cmdArray[1]]={};
			}
		}
		return (
			<PluginComponent key={"plugin"} {...pluginArgs}/>
		)
	} else {
		return (<h1 key={"renderError"}>NO SUCH Component {pluginId}</h1>)
	}

}