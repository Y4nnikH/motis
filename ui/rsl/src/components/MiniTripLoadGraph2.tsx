import { PaxMonEdgeLoadInfo } from "@/api/protocol/motis/paxmon";

export type MiniTripLoadGraph2Props = {
  edges: PaxMonEdgeLoadInfo[];
};

interface SectionGeometry {
  x: number;
  width: number;
  forecastHeight: number;
  forecastColor: string;
  capacityHeight: number;
  expectedHeight: number;
}

function getSectionColor(capacity: number, maxLoad: number) {
  if (capacity == 0) {
    return "#3C414B";
  } else {
    const load = maxLoad / capacity;
    if (load > 2.0) {
      return "#C50014";
    } else if (load > 1.2) {
      return "#EC0016";
    } else if (load > 1.0) {
      return "#F39200";
    } else if (load > 0.8) {
      return "#FFD800";
    } else {
      return "#408335";
    }
  }
}

function MiniTripLoadGraph2({ edges }: MiniTripLoadGraph2Props): JSX.Element {
  const graphWidth = 1000;
  const graphHeight = 100;

  // const minEdgeLoad = (eli: PaxMonEdgeLoadInfo) =>
  //   eli.passenger_cdf.length > 0 ? eli.passenger_cdf[0].passengers : 0;
  const maxEdgeLoad = (eli: PaxMonEdgeLoadInfo) =>
    eli.passenger_cdf.length > 0
      ? eli.passenger_cdf[eli.passenger_cdf.length - 1].passengers
      : 0;
  // const avgEdgeLoad = (eli: PaxMonEdgeLoadInfo) =>
  //   eli.passenger_cdf.length > 0 ? paxQuantile(eli.passenger_cdf, 0.5) : 0;

  const maxCapacity = edges.reduce(
    (max, eli) => (eli.capacity ? Math.max(max, eli.capacity) : max),
    0
  );
  const totalMaxPax = edges.reduce(
    (max, eli) => Math.max(max, maxEdgeLoad(eli)),
    0
  );
  const totalMaxLoad = Math.max(maxCapacity, totalMaxPax, 1);

  //const loadY = (load: number) => (1 - load / totalMaxLoad) * graphHeight;
  const loadHeight = (load: number) => (load / totalMaxLoad) * graphHeight;

  const sectionDurations = edges.map((e) =>
    Math.max(300, e.arrival_schedule_time - e.departure_schedule_time)
  );
  const totalDuration = sectionDurations.reduce((sum, v) => sum + v);
  const sectionGeometry = edges.reduce(
    (a, eli, idx) => {
      const capacity = eli.capacity;
      const maxLoad = maxEdgeLoad(eli);
      const sg = {
        x: a.x,
        width: (sectionDurations[idx] / totalDuration) * graphWidth,
        forecastHeight: loadHeight(maxLoad),
        forecastColor: getSectionColor(capacity, maxLoad),
        capacityHeight: loadHeight(capacity),
        expectedHeight: loadHeight(eli.expected_passengers),
      };
      return { x: sg.x + sg.width, sections: [...a.sections, sg] };
    },
    { x: 0, sections: [] as SectionGeometry[] }
  ).sections;

  return (
    <svg viewBox={`0 0 ${graphWidth} ${graphHeight}`} className="w-full">
      {/*
      <rect
        x="0"
        y="0"
        width={graphWidth}
        height={graphHeight}
        className="fill-db-cool-gray-100"
      />
      */}
      <g>
        {sectionGeometry.map((sg, idx) => (
          <g key={idx}>
            {/*
            <rect
              x={sg.x}
              y={0}
              width={sg.width}
              height={graphHeight}
              fill={sg.forecastColor}
              fillOpacity="0.2"
            />
            */}
            <rect
              x={sg.x}
              y={graphHeight - sg.forecastHeight}
              width={sg.width}
              height={sg.forecastHeight}
              fill={sg.forecastColor}
            />
            {/*
            <rect
              x={sg.x}
              y={graphHeight - sg.expectedHeight}
              width={sg.width}
              height={sg.expectedHeight}
              className="fill-gray-600/30"
            />
            */}
            {/*
            <path
              className="stroke-gray-800"
              strokeWidth="4"
              strokeDasharray="4"
              d={`M ${sg.x} ${graphHeight - sg.expectedHeight} h ${sg.width}`}
            />
            */}
            {/*
            <path
              className="stroke-gray-100"
              strokeWidth="2"
              d={`M ${sg.x} ${graphHeight - sg.capacityHeight} h ${sg.width}`}
            />
            */}
          </g>
        ))}
      </g>
      {/*
      <rect
        x="0"
        y="0"
        width={graphWidth}
        height={graphHeight}
        fill="transparent"
        stroke="#333"
      />
      */}
    </svg>
  );
}

export default MiniTripLoadGraph2;