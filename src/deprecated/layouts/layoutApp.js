import React, {useRef, useState} from 'react';

import {configs} from "themeLocaria";
import {useStyles} from "stylesLocaria";


import {useCookies} from 'react-cookie';
import {Link, useHistory, useLocation, useParams} from 'react-router-dom';
import Map from "../map";
import {Box} from "@mui/material";
import {SearchDrawer} from "../drawers/searchDrawer";
import {ViewDrawer} from "../drawers/viewDrawer";
import LandingDrawer from "../drawers/landingDrawer";
import MenuDrawer from "../drawers/menuDrawer";
import Multi from "../multi";
import {useSelector, useDispatch} from 'react-redux'
import {
    closeSearchDrawer,
    openSearchDrawer
} from '../../redux/slices/searchDrawerSlice'
import {openViewDraw} from '../../redux/slices/viewDrawerSlice'
import {closeMultiSelect, openMultiSelect} from '../../redux/slices/multiSelectSlice'
import PageDrawer from "../drawers/pageDrawer";
import {newRoute, openLayout, routeUpdated, setLocation, setResolutions} from "../../redux/slices/layoutSlice";
import {openPageDialog} from "../../redux/slices/pageDialogSlice";
import {closeLandingDraw, openLandingDraw} from "../../redux/slices/landingDrawerSlice";


import NavFabFilter from "../fabs/navFabFilter";
import {openHomeDrawer} from "../../redux/slices/homeDrawerSlice";
import HomeDrawer from "../drawers/homeDrawer";
import NavTypeFull from "../navs/navTypeFull";
import NavTypeSimple from "../navs/navTypeSimple";
import RenderNav from "../navs/renderNav";
import PathRouter from "../../../libs/PathRouter";


const LayoutApp = () => {
    const mapRef = useRef();
    const location = useLocation();
    // params?

    let {category} = useParams();
    let {pageId} = useParams();
    let {feature} = useParams();
    let {search} = useParams();
    const classes = useStyles();

    const dispatch = useDispatch()
    const history = useHistory();


    const [setOpenSuccess] = React.useState(false);
    const [features, setFeatures] = React.useState({});
    const [currentPath,setCurrentPath] = useState(false);
    const viewDrawOpen = useSelector((state) => state.viewDraw.open);
    const searchDrawOpen = useSelector((state) => state.searchDraw.open);
    const homeDrawerOpen = useSelector((state) => state.homeDrawer.open);
    const open = useSelector((state) => state.layout.open);
    const route = useSelector((state) => state.layout.route);
    const homeLocation = useSelector((state) => state.layout.homeLocation);

    const resolutions = useSelector((state) => state.layout.resolutions);


    const [cookies, setCookies] = useCookies(['location']);

    const isInitialMount = useRef(true);

    if(location.pathname!==currentPath) {
        setCurrentPath(location.pathname);
        dispatch(newRoute());
    }

    const drawStateRouter = () => {

        let route = PathRouter(location.pathname);

        switch (route) {
            case '/':
                dispatch(openLandingDraw());
                return;
            case '/Home':
                dispatch(openHomeDrawer());
                return;
            case '/Map':
                dispatch(openLayout());
                return;

        }
/*
        if (location.pathname === '/') {
            // This is a default landing so find out if we need to direct them
            if (window.systemMain.landingRoute && window.systemMain.landingRoute !== '/')
                history.push(window.systemMain.landingRoute);
            else
                dispatch(openLandingDraw());
            return;
        }
*/

/*        if (location.pathname.match('^/Home') && homeDrawerOpen === false) {
            dispatch(openHomeDrawer())
            return;
        }*/

        if (location.pathname.match('^/Search/.*') && searchDrawOpen === false) {
            if (category) {
                dispatch(openSearchDrawer({categories: JSON.parse(category), search: search}));
            } else {
                dispatch(openSearchDrawer());
            }

            return;
        }


        if (feature && viewDrawOpen === false) {
            dispatch(openViewDraw({fid: feature, category: category}));
            return;
        }
/*
        if (location.pathname.match('^/Map') && open === false) {
            dispatch(openLayout())
            return;
        }*/


    }

    React.useEffect(() => {
        if(route===true) {
            drawStateRouter();
            dispatch(routeUpdated());

        }
    }, [route]);


    React.useEffect(() => {


        if (isInitialMount.current) {
            isInitialMount.current = false;
            if (cookies.location) {
                dispatch(setLocation(cookies.location))
            } else {
                console.log('no location');
            }

        } else {
            if (open) {
                history.push(`/Map`);
                dispatch(closeLandingDraw());
                dispatch(closeSearchDrawer());
                dispatch(closeMultiSelect());
                //forceMapRefresh();
                displayMapData();

            }
        }

        window.websocket.registerQueue("homeLoader", function (json) {
            if (open === true)
                mapRef.current.addGeojson(json.packet.geojson);
            setFeatures(json.packet.geojson);
        });

        return () => {
            window.websocket.removeQueue("homeLoader");
        }

    }, [open]);


    function displayMapData() {
        mapRef.current.addGeojson(features);
    }

    const handleFeatureSelected = function (features, geojsonFeatures) {
        if (features[0].get('geometry_type') === 'cluster') {
            mapRef.current.zoomToExtent(features[0].get('extent'));
        } else {
            if (features.length > 1) {
                dispatch(openMultiSelect(geojsonFeatures.features));
            } else {
                dispatch(openViewDraw({fid: features[0].get('fid'), category: features[0].get('category')}));
            }
        }
    }

    const forceMapRefresh = () => {
        if (resolutions !== undefined) {
            if (open === true || features.features === undefined) {
                updateMap(resolutions);
            }
        }
    }

    const onZoomChange = (newRes) => {
        dispatch(setResolutions(newRes));
        //setResolutions(newRes);
    }

    React.useEffect(() => {
        if (resolutions !== undefined)
            forceMapRefresh();
    }, [resolutions]);

    React.useEffect(() => {
        if (pageId) {
            dispatch(openPageDialog(pageId));
        }

    }, [pageId]);

    React.useEffect(() => {

        if (homeLocation !== false && homeLocation !== undefined && window.systemMain.searchLocation !== false) {
            mapRef.current.markHome(homeLocation.location);
            setCookies('location', homeLocation, {path: '/', sameSite: true});
        }

    }, [homeLocation]);

    const updateMap = (newRes) => {
        let packet = {
            "queue": "homeLoader",
            "api": "api",
            "data": {
                "method": "search",
                "category": configs.homeCategorySearch,
                "bbox": `${newRes.extent4326[0]} ${newRes.extent4326[1]},${newRes.extent4326[2]} ${newRes.extent4326[3]}`,
                "cluster": newRes.resolution >= window.systemMain.clusterCutOff,
                "cluster_width": Math.floor(window.systemMain.clusterWidthMod * newRes.resolution),
                "cluster_algorithm": window.systemMain.clusterAlgorithm
            }
        };
        window.websocket.send(packet);
    }


    function closeSuccess() {
        setOpenSuccess(false);
    }



    return (
        <>
            <RenderNav/>

            <div className={classes.grow}>
                <SearchDrawer mapRef={mapRef}/>
                <MenuDrawer/>
                <ViewDrawer mapRef={mapRef}/>
                <Multi mapRef={mapRef}/>

                <HomeDrawer/>
                <LandingDrawer/>
                <PageDrawer/>
                <Box sx={{
                    height: 'calc(100vh - 64px)',
                    position: "relative",
                    width: '100%'
                }}>
                    <Map id={'mainMap'}
                         className={'mapView'}
                         ref={mapRef}
                         onFeatureSeleted={handleFeatureSelected}
                         onZoomChange={onZoomChange}
                    />
                </Box>
            </div>

            <NavFabFilter/>
        </>
    )
}


export default LayoutApp;
