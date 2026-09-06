import {loadFont as loadJetBrainsMono} from '@remotion/google-fonts/JetBrainsMono';
import {loadFont as loadOnest} from '@remotion/google-fonts/Onest';
import React from 'react';
import {
  AbsoluteFill,
  Easing,
  Interactive,
  interpolate,
  interpolateColors,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

type Point = {x: number; y: number};

type Employee = Point & {
  id: number;
  selected: boolean;
  weight: number;
};

type Cluster = {
  id: string;
  leader: Point;
  accent: string;
  accentSoft: string;
  employees: Employee[];
};

const {fontFamily: uiFont} = loadOnest('normal', {
  weights: ['400', '500', '600', '700'],
  subsets: ['cyrillic', 'latin'],
});

const {fontFamily: monoFont} = loadJetBrainsMono('normal', {
  weights: ['500', '600'],
  subsets: ['cyrillic', 'latin'],
});

const COLORS = {
  ink: '#17191f',
  muted: '#696f7d',
  faint: '#969cab',
  line: '#d9dce7',
  blue: '#4b77ea',
  blueSoft: '#e7eeff',
  green: '#00a995',
} as const;

const clusters: Cluster[] = [
  {
    id: '01',
    leader: {x: 290, y: 455},
    accent: COLORS.blue,
    accentSoft: COLORS.blueSoft,
    employees: [
      {id: 1, x: 135, y: 285, selected: true, weight: 92},
      {id: 2, x: 318, y: 245, selected: true, weight: 84},
      {id: 3, x: 455, y: 315, selected: false, weight: 41},
      {id: 4, x: 470, y: 610, selected: true, weight: 78},
      {id: 5, x: 205, y: 645, selected: false, weight: 27},
    ],
  },
  {
    id: '02',
    leader: {x: 800, y: 455},
    accent: COLORS.blue,
    accentSoft: COLORS.blueSoft,
    employees: [
      {id: 6, x: 650, y: 295, selected: true, weight: 95},
      {id: 7, x: 810, y: 220, selected: false, weight: 38},
      {id: 8, x: 960, y: 305, selected: true, weight: 88},
      {id: 9, x: 975, y: 610, selected: true, weight: 81},
      {id: 10, x: 655, y: 635, selected: false, weight: 32},
    ],
  },
  {
    id: '03',
    leader: {x: 1300, y: 455},
    accent: COLORS.blue,
    accentSoft: COLORS.blueSoft,
    employees: [
      {id: 11, x: 1145, y: 295, selected: true, weight: 91},
      {id: 12, x: 1290, y: 220, selected: true, weight: 86},
      {id: 13, x: 1460, y: 315, selected: false, weight: 44},
      {id: 14, x: 1440, y: 610, selected: true, weight: 79},
      {id: 15, x: 1155, y: 635, selected: false, weight: 29},
    ],
  },
];

const ease = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = {
  extrapolateLeft: 'clamp' as const,
  extrapolateRight: 'clamp' as const,
};

const phaseCopy = (frame: number) => {
  if (frame < 92) {
    return {
      title: 'Список превращается в карту связей',
      note: 'Три бригадира становятся опорными узлами, сотрудники — отдельными карточками',
      step: 1,
    };
  }
  if (frame < 176) {
    return {
      title: 'На каждой связи появляется вес',
      note: 'Число складывается из истории совместной работы и дополнительных правил',
      step: 2,
    };
  }
  if (frame < 252) {
    return {
      title: 'Алгоритм выбирает наибольшие значения',
      note: 'Сильные подтверждённые связи получают цвет и собираются вокруг бригадира',
      step: 3,
    };
  }
  return {
    title: 'Три состава готовы к проверке',
    note: 'Решение остаётся объяснимым: видны сотрудники, веса и причина выбора',
    step: 4,
  };
};

const GraphEdge: React.FC<{
  from: Point;
  to: Point;
  start: number;
  selected: boolean;
  accent: string;
  finalProgress: number;
}> = ({from, to, start, selected, accent, finalProgress}) => {
  const frame = useCurrentFrame();
  const draw = interpolate(frame, [start, start + 24], [1, 0], {...clamp, easing: ease});
  const confirmedAccent = interpolateColors(finalProgress, [0, 1], [accent, COLORS.green]);
  const selectedProgress = selected
    ? interpolate(frame, [166, 204], [0, 1], {...clamp, easing: ease})
    : 0;

  return (
    <>
      <line
        x1={from.x}
        y1={from.y}
        x2={to.x}
        y2={to.y}
        pathLength={1}
        stroke={COLORS.line}
        strokeWidth={2}
        strokeLinecap="round"
        strokeDasharray={1}
        strokeDashoffset={draw}
        opacity={0.92}
      />
      {selected ? (
        <line
          x1={from.x}
          y1={from.y}
          x2={to.x}
          y2={to.y}
          pathLength={1}
          stroke={confirmedAccent}
          strokeWidth={5}
          strokeLinecap="round"
          strokeDasharray={1}
          strokeDashoffset={1 - selectedProgress}
          opacity={selectedProgress}
        />
      ) : null}
    </>
  );
};

const WeightBadge: React.FC<{
  from: Point;
  to: Point;
  weight: number;
  selected: boolean;
  accent: string;
  index: number;
  finalProgress: number;
}> = ({from, to, weight, selected, accent, index, finalProgress}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const appear = spring({
    frame: frame - 94 - index * 3,
    fps,
    config: {damping: 20, stiffness: 180},
  });
  const selectedProgress = selected
    ? interpolate(frame, [170, 202], [0, 1], {...clamp, easing: ease})
    : 0;
  const confirmedAccent = interpolateColors(finalProgress, [0, 1], [accent, COLORS.green]);
  const x = from.x + (to.x - from.x) * 0.56;
  const y = from.y + (to.y - from.y) * 0.56;

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: 48,
        height: 30,
        translate: '-50% -50%',
        scale: appear * (1 + selectedProgress * 0.08),
        opacity: appear,
        borderRadius: 999,
        border: `1px solid ${selected ? confirmedAccent : COLORS.line}`,
        background: '#ffffff',
        boxShadow: selected
          ? `0 8px 22px ${confirmedAccent}33, 0 0 0 ${3 * selectedProgress}px ${confirmedAccent}16`
          : '0 7px 18px rgba(64, 68, 92, 0.09)',
        display: 'grid',
        placeItems: 'center',
        color: selected && selectedProgress > 0.45 ? confirmedAccent : COLORS.muted,
        fontFamily: monoFont,
        fontSize: 12,
        fontWeight: 600,
        zIndex: 7,
      }}
    >
      {weight}
    </div>
  );
};

const EmployeeCard: React.FC<{
  employee: Employee;
  cluster: Cluster;
  index: number;
  finalProgress: number;
}> = ({employee, cluster, index, finalProgress}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const entrance = spring({
    frame: frame - 22 - index * 2,
    fps,
    config: {damping: 22, stiffness: 145},
  });
  const selectedProgress = employee.selected
    ? interpolate(frame, [174 + (index % 5) * 3, 210 + (index % 5) * 3], [0, 1], {
        ...clamp,
        easing: ease,
      })
    : 0;
  const confirmedAccent = interpolateColors(finalProgress, [0, 1], [cluster.accent, COLORS.green]);
  const confirmedAccentSoft = interpolateColors(finalProgress, [0, 1], [cluster.accentSoft, '#def6f1']);

  return (
    <div
      style={{
        position: 'absolute',
        left: employee.x,
        top: employee.y,
        width: 176,
        height: 64,
        translate: '-50% -50%',
        scale: entrance * (1 + selectedProgress * 0.025),
        opacity: entrance,
        borderRadius: 18,
        border: '1px solid rgba(255, 255, 255, 0.92)',
        background:
          'linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(246,247,252,0.94) 72%, rgba(239,241,249,0.9) 100%)',
        boxShadow: employee.selected
          ? `0 22px 58px -34px ${confirmedAccent}99, inset 0 1px 0 rgba(255,255,255,0.96), inset 0 0 0 ${1.5 * selectedProgress}px ${confirmedAccent}`
          : '0 24px 58px -42px rgba(72, 78, 128, 0.5), inset 0 1px 0 rgba(255,255,255,0.95)',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '0 16px',
        color: COLORS.ink,
        zIndex: 10,
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          flex: '0 0 auto',
          borderRadius: 11,
          background: `linear-gradient(145deg, ${confirmedAccentSoft}, #ffffff)`,
          border: `1px solid ${confirmedAccent}33`,
          display: 'grid',
          placeItems: 'center',
          color: confirmedAccent,
          fontFamily: monoFont,
          fontSize: 11,
          fontWeight: 600,
        }}
      >
        {String(employee.id).padStart(2, '0')}
      </div>
      <div style={{minWidth: 0}}>
        <div
          style={{
            color: selectedProgress > 0.62 ? confirmedAccent : COLORS.faint,
            fontFamily: monoFont,
            fontSize: 8,
            fontWeight: 600,
            letterSpacing: '0.1em',
            lineHeight: 1,
          }}
        >
          {selectedProgress > 0.62 ? 'В СОСТАВЕ' : 'КАНДИДАТ'}
        </div>
        <div style={{marginTop: 6, fontSize: 14, fontWeight: 620, lineHeight: 1, whiteSpace: 'nowrap'}}>
          Сотрудник {employee.id}
        </div>
      </div>
    </div>
  );
};

const LeaderNode: React.FC<{cluster: Cluster; index: number; finalProgress: number}> = ({
  cluster,
  index,
  finalProgress,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const ready = interpolate(frame, [252 + index * 7, 280 + index * 7], [0, 1], {
    ...clamp,
    easing: ease,
  });
  const confirmedAccent = interpolateColors(finalProgress, [0, 1], [cluster.accent, COLORS.green]);
  const confirmedAccentSoft = interpolateColors(finalProgress, [0, 1], [cluster.accentSoft, '#def6f1']);

  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: cluster.leader.x,
          top: cluster.leader.y,
          width: 112,
          height: 112,
          translate: '-50% -50%',
          scale: spring({
            frame: frame - 14 - index * 7,
            fps,
            config: {damping: 20, stiffness: 135},
          }),
          borderRadius: 999,
          border: `6px solid ${confirmedAccentSoft}`,
          background: COLORS.ink,
          boxShadow: `0 23px 54px rgba(28,29,33,0.18), 0 0 0 ${8 * ready}px ${confirmedAccent}15`,
          display: 'grid',
          placeItems: 'center',
          color: '#ffffff',
          zIndex: 14,
        }}
      >
        <div style={{textAlign: 'center'}}>
          <div
            style={{
              fontFamily: monoFont,
              color: '#aeb2bd',
              fontSize: 9,
              fontWeight: 600,
              letterSpacing: '0.1em',
            }}
          >
            БРИГАДИР
          </div>
          <div style={{marginTop: 4, fontSize: 31, fontWeight: 650, lineHeight: 1}}>{cluster.id}</div>
        </div>
        <div
          style={{
            position: 'absolute',
            right: -3,
            bottom: -3,
            width: 29,
            height: 29,
            display: 'grid',
            placeItems: 'center',
            borderRadius: 999,
            border: '3px solid #ffffff',
            background: confirmedAccent,
            color: '#ffffff',
            fontSize: 14,
            fontWeight: 700,
            opacity: ready,
            scale: ready,
          }}
        >
          ✓
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          left: cluster.leader.x,
          top: cluster.leader.y + 72,
          translate: '-50% 0',
          padding: '7px 12px 6px',
          borderRadius: 999,
          background: confirmedAccentSoft,
          color: confirmedAccent,
          fontFamily: monoFont,
          fontSize: 9,
          fontWeight: 600,
          letterSpacing: '0.07em',
          opacity: ready,
          zIndex: 13,
        }}
      >
        СОСТАВ СОБРАН
      </div>
    </>
  );
};

export const CrewRelationshipGraph: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const phase = phaseCopy(frame);
  const whiteoutOpacity = interpolate(
    frame,
    [0, 16, durationInFrames - 30, durationInFrames - 1],
    [1, 0, 0, 1],
    {...clamp, easing: ease},
  );
  const finalProgress = interpolate(frame, [252, 286], [0, 1], {...clamp, easing: ease});
  const confirmedAccent = interpolateColors(finalProgress, [0, 1], [COLORS.blue, COLORS.green]);
  const edges = clusters.flatMap((cluster, clusterIndex) =>
    cluster.employees.map((employee, employeeIndex) => ({
      cluster,
      employee,
      index: clusterIndex * 5 + employeeIndex,
    })),
  );

  return (
    <AbsoluteFill
      style={{
        background:
          'radial-gradient(circle at 50% 49%, rgba(129,112,245,0.09), transparent 35%), radial-gradient(circle at 86% 64%, rgba(0,169,149,0.06), transparent 27%), linear-gradient(180deg, #fbfbfe 0%, #f5f6fb 100%)',
        color: COLORS.ink,
        fontFamily: uiFont,
        overflow: 'hidden',
      }}
    >
      <Interactive.Div
        name="Title"
        style={{
          position: 'absolute',
          left: 76,
          top: 58,
          zIndex: 110,
        }}
      >
        <div style={{fontSize: 48, fontWeight: 620, lineHeight: 1, letterSpacing: '-0.035em'}}>
          Карта рабочих связей
        </div>
        <div
          style={{
            marginTop: 12,
            color: COLORS.muted,
            fontFamily: monoFont,
            fontSize: 13,
            fontWeight: 500,
            letterSpacing: '0.08em',
          }}
        >
          3 БРИГАДИРА · 15 КАНДИДАТОВ · УСЛОВНЫЕ ДАННЫЕ
        </div>
      </Interactive.Div>

      <Interactive.Div
        name="Legend"
        style={{
          position: 'absolute',
          right: 78,
          top: 63,
          zIndex: 30,
          display: 'flex',
          alignItems: 'center',
          gap: 18,
          opacity: interpolate(frame, [22, 42], [0, 1], {...clamp, easing: ease}),
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 9,
            color: COLORS.muted,
            fontSize: 13,
          }}
        >
          <span
            style={{
              width: 43,
              height: 28,
              display: 'grid',
              placeItems: 'center',
              borderRadius: 999,
              border: `1px solid ${COLORS.line}`,
              background: '#ffffff',
              fontFamily: monoFont,
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            84
          </span>
          вес связи
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 9,
            color: COLORS.muted,
            fontSize: 13,
          }}
        >
          <span style={{width: 34, height: 5, borderRadius: 99, background: confirmedAccent}} />
          выбрана
        </div>
      </Interactive.Div>

      <svg width="1600" height="900" style={{position: 'absolute', inset: 0, zIndex: 2}} aria-hidden="true">
        {edges.map(({cluster, employee, index}) => (
          <GraphEdge
            key={`${cluster.id}-${employee.id}`}
            from={cluster.leader}
            to={employee}
            start={48 + index * 3}
            selected={employee.selected}
            accent={cluster.accent}
            finalProgress={finalProgress}
          />
        ))}
      </svg>

      {edges.map(({cluster, employee, index}) => (
        <WeightBadge
          key={`weight-${cluster.id}-${employee.id}`}
          from={cluster.leader}
          to={employee}
          weight={employee.weight}
          selected={employee.selected}
          accent={cluster.accent}
          index={index}
          finalProgress={finalProgress}
        />
      ))}

      {clusters.map((cluster, clusterIndex) => (
        <React.Fragment key={cluster.id}>
          <LeaderNode cluster={cluster} index={clusterIndex} finalProgress={finalProgress} />
          {cluster.employees.map((employee, employeeIndex) => (
            <EmployeeCard
              key={employee.id}
              employee={employee}
              cluster={cluster}
              index={clusterIndex * 5 + employeeIndex}
              finalProgress={finalProgress}
            />
          ))}
        </React.Fragment>
      ))}

      <Interactive.Div
        name="Narrative"
        style={{
          position: 'absolute',
          left: 76,
          right: 76,
          bottom: 49,
          zIndex: 30,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
        }}
      >
        <div>
          <div style={{fontSize: 25, fontWeight: 620, letterSpacing: '-0.02em'}}>{phase.title}</div>
          <div style={{marginTop: 5, color: COLORS.muted, fontSize: 14}}>{phase.note}</div>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 9}}>
          {[1, 2, 3, 4].map((step) => (
            <span
              key={step}
              style={{
                width: step === phase.step ? 28 : 8,
                height: 8,
                borderRadius: 99,
                background: step <= phase.step ? confirmedAccent : COLORS.line,
              }}
            />
          ))}
          <span
            style={{
              marginLeft: 5,
              color: finalProgress > 0.8 ? '#087d70' : COLORS.muted,
              fontFamily: monoFont,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.08em',
            }}
          >
            {finalProgress > 0.8 ? 'СОСТАВЫ ГОТОВЫ' : 'АНАЛИЗ СВЯЗЕЙ'}
          </span>
        </div>
      </Interactive.Div>

      <AbsoluteFill
        style={{
          zIndex: 100,
          background: '#ffffff',
          opacity: whiteoutOpacity,
          pointerEvents: 'none',
        }}
      />
    </AbsoluteFill>
  );
};
