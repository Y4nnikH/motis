import React, { useEffect, useState } from 'react';

import moment from 'moment';

import { JourneyRender, duration} from './Journey';
import { Connection, Station, Transport, TripId, TripViewConnection } from '../Types/Connection';
import { Translations } from '../App/Localization';
import { getMapFilter } from './Overlay';
import { Address } from '../Types/SuggestionTypes';
import { SubOverlayEvent } from '../Types/EventHistory';


interface TripView {
    'trainSelected': TripId | Connection,
    'translation': Translations,
    'mapFilter': any
    'setTrainSelected': React.Dispatch<React.SetStateAction<TripId>>,
    'setTripViewHidden': React.Dispatch<React.SetStateAction<Boolean>>,
    'subOverlayContent': SubOverlayEvent[], 
    'setSubOverlayContent': React.Dispatch<React.SetStateAction<SubOverlayEvent[]>>,
}


const getTransportCountString = (transports: Transport[], translation: Translations) => {
    let count = 0;
    for (let index = 0; index < transports.length; index++) {
        if (transports[index].move_type === 'Transport' && index > 0) {
            count++
        }
    }
    return translation.connections.interchanges(count);
}


// Helperfunction to differentiate objects that can be either a TripId or a Connection
const isTripId = (t: TripId | Connection): t is TripId => {
    return (t as TripId).line_id !== undefined
}


const getTrainConnection = (lineId: string, stationId: string, targetStationId: string, targetTime: number, time: number, trainNr: number) => {
    return {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            destination: { type: "Module", target: "/trip_to_connection" },
            content_type: 'TripId',
            content: { line_id: lineId, station_id: stationId, target_station_id: targetStationId, target_time: targetTime, time: time, train_nr: trainNr }
        })
    };
};


export const TripView: React.FC<TripView> = (props) => {

    const [trainConnection, setTrainConnection] = useState<Connection>(isTripId(props.trainSelected) ? undefined : props.trainSelected);

    const time = isTripId(props.trainSelected) ? props.trainSelected.time : props.trainSelected.stops[0].departure.time;

    const targetTime = isTripId(props.trainSelected) ? props.trainSelected.target_time : props.trainSelected.stops.at(-1).arrival.time;

    useEffect(() => {
        if (props.trainSelected && isTripId(props.trainSelected)) {
            let requestURL = 'https://europe.motis-project.de/?elm=tripRequest';
            fetch(requestURL, getTrainConnection(props.trainSelected.line_id, props.trainSelected.station_id, props.trainSelected.target_station_id, props.trainSelected.target_time, props.trainSelected.time, props.trainSelected.train_nr))
                .then(res => res.json())
                .then((res: TripViewConnection) => {
                    console.log('Trip Request successful');
                    console.log(res);
                    setTrainConnection(res.content);
                    window.portEvents.pub('mapSetDetailFilter', getMapFilter(res.content));
                });
        }
    }, [props.trainSelected]);

    return (
        (trainConnection === undefined) ?
            <></> 
            :
            <div className={`connection-details ${isTripId(props.trainSelected) ? 'trip-view' : ''}`}>
                <div className='connection-info'>
                    <div className='header'>
                        <div className='back' onClick={() => {
                                                if (isTripId(props.trainSelected)) {
                                                    let tmp = [...props.subOverlayContent];
                                                    tmp.pop();
                                                    props.setSubOverlayContent(tmp);
                                                    window.portEvents.pub('mapSetDetailFilter', props.mapFilter);
                                                } else {
                                                    props.setTripViewHidden(true);
                                                }
                                                }}>
                            <i className='icon'>arrow_back</i>
                        </div>
                        <div className='details'>
                            <div className='date'>{moment.unix(time).format(props.translation.dateFormat)}</div>
                            <div className='connection-times'>
                                <div className='times'>
                                    <div className='connection-departure'>{moment.unix(time).format('HH:mm')}</div>
                                    <div className='connection-arrival'>{moment.unix(targetTime).format('HH:mm')}</div>
                                </div>
                                <div className='locations'>
                                    <div>{trainConnection.stops[0].station.name}</div>
                                    <div>{trainConnection.stops[trainConnection.stops.length - 1].station.name}</div>
                                </div>
                            </div>
                            <div className='summary'>
                                <span className='duration'>
                                    <i className='icon'>schedule</i>
                                    {duration(time, targetTime)}
                                </span>
                                <span className='interchanges'>
                                    <i className='icon'>transfer_within_a_station</i>
                                    {getTransportCountString(trainConnection.transports, props.translation)}
                                </span>
                            </div>
                        </div>
                        {isTripId(props.trainSelected) ? 
                            <div className='actions' />
                            :
                            <div className="actions">
                                <i className="icon">save</i>
                                <i className="icon">share</i>
                            </div>
                        }  
                    </div>
                </div>
                <div className='connection-journey' id='sub-connection-journey'>
                    <JourneyRender connection={trainConnection} setTrainSelected={props.setTrainSelected} translation={props.translation} subOverlayContent={props.subOverlayContent} setSubOverlayContent={props.setSubOverlayContent}/>
                </div>
            </div>
    )
}