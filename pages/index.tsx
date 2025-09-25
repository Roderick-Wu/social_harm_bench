import { useEffect, useState } from 'react';
import RoundSlider from '@/components/round_slider';
import AgentThink from '@/components/agent_think';
import AgentStats from '@/components/agent_stats';
import PopulationChart from '@/components/population_chart';
//import '@/globals.css';

type reputation = {
  cooperation_rate: number | null;
  betrayal_rate: number | null;
};

type agent_match = {
  name: string;
  action: string;
  points: number;
  response: string;
  reputation: reputation;
};

type evolution_stats = {
  population: number;
  name: string;
  fitness: number;
};

type step_data = {
  step: number;
  stats: evolution_stats[];
  match_records: agent_match[][];
};

type game_data = {
  game: {
    type: string;
    kwargs: {
      payoff_matrix: {
        CC: number[];
        CD: number[];
        DC: number[];
        DD: number[];
      };
    };
  };
  evolution: { initial_population: string; steps: number };
  mechanism: { type: string };
  agents: {
    llm: { model: string; kwargs: { max_new_tokens: number } };
    type: string;
    name: string;
  }[];
};

const fetchRepositories = async () => {
  try {
    const response = await fetch('https://api.github.com/repos/Xiao215/agent-tournament/contents/results');
    const contents = await response.json();
    
    // Filter for directories only
    const directories = contents
      .filter((item: any) => item.type === 'dir')
      .map((item: any) => item.name);
    
    return directories;
  } catch (error) {
    console.error('Error fetching repositories:', error);
    return ['reputation'];
  }
};

export default function Home() {
  const [game_data, set_all] = useState<game_data | null>(null);
  const [round_data, set_round] = useState<step_data[] | null>(null);
  const [selected_round, set_selected_round] = useState(0);

  const [available_repos, set_available_repos] = useState<string[]>([]);
  const [select_repo, set_select_repo] = useState("");

  const config_link = `https://raw.githubusercontent.com/Xiao215/agent-tournament/main/results/${select_repo}/config.json`;
  const evolution_link = `https://raw.githubusercontent.com/Xiao215/agent-tournament/main/results/${select_repo}/evolution.json`;


  useEffect(() => {
    const fetchRepos = async () => {
      const repos = await fetchRepositories();
      set_available_repos(repos);
      //repos.push("test");
      set_select_repo(repos[0]);
    };
    fetchRepos();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const setup_game = await fetch(config_link);
        const game_info = await setup_game.json();
        set_all(game_info);

        const res = await fetch(evolution_link);
        const json = await res.json();
        set_round(json);
      } catch (error) {
        set_all(null);
        set_round(null);
      }
    };
    fetchData();
  }, [select_repo]);



  if (round_data == null || round_data.length === 0)
    return (
      <div className="app-container">
        <header className="app-header">
          <h1 className="app-title">LLM Evolution Demo</h1>
        </header>

        <div className="controls-section">
          <h2 className="controls-title">Controls</h2>
          <div className="json-select">
            Select json files:
            <div className="json-dropdown">
              <select
                value={select_repo}
                onChange={(e) => set_select_repo(e.target.value)}
              >
                {available_repos.map((repo) => (
                  <option key={repo} value={repo}>
                    {repo.charAt(0).toUpperCase() + repo.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    );

  const this_round_data = round_data[selected_round] || {};

  const agent_thoughts: Record<
    string,
    { model: string; thought: string }
  > = {};
  const agent_stats: Record<string, { score: number; reputation: reputation }> =
    {};
  const evolution_stats = this_round_data.stats;

  this_round_data.match_records.flat().forEach((agent) => {
    const model = agent.name;

    if (!agent_thoughts[model]) {
      agent_thoughts[model] = {
        model: model,
        thought: agent.response.startsWith("Thought:")
          ? agent.response
          : `... sitting out this round ...`,
      };
    }

    // Aggregate stats
    if (!agent_stats[model]) {
      agent_stats[model] = {
        score: 0,
        reputation: agent.reputation,
      };
    }
    agent_stats[model].score += agent.points;
  });

  const thoughts = Object.entries(agent_thoughts).map(([model, thoughtObj]) => ({
      ...thoughtObj,
      name: model,
  }));

  const stats = Object.entries(agent_stats).map(([model, stat], i) => ({
    model,
    score: stat.score,
    reputation: stat.reputation.cooperation_rate ?? 0,
  }));

  const populationChart = Object.entries(agent_stats).map(([model, stat], i) => ({
    model,
    count: evolution_stats[i].population * 100, // scale for visualization
    score: stat.score,
    reputation: stat.reputation.cooperation_rate ?? 0,
  }));

  // const populationChart = Object.keys(agent_stats).map((model, i) => ({
  //   model,
  //   count: evolution_stats[i].population * 100, // scale for visualization
  //   score: evolution_stats[i].fitness,
  //   reputation: agent_stats[model].reputation.cooperation_rate ?? 0,
  // }));

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">LLM Evolution Demo</h1>
      </header>

      <div className="controls-section">
        {/* <h2 className="controls-title">Controls</h2> */}
        <div className="json-select">
          Select directory:
          <div className="json-dropdown">
            <select
              value={select_repo}
              onChange={(e) => set_select_repo(e.target.value)}
            >
              {available_repos.map((repo) => (
                <option key={repo} value={repo}>
                  {repo.charAt(0).toUpperCase() + repo.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="main-layout">
        <div className="upperbar">
          <div className="top-row">
            <div className="info-section">
              <h2 className="upperbar-title">Game Setup</h2>
              <div className="game-setup-item">
                <strong>Game Type:</strong> {game_data?.game.type}
              </div>
              <div className="game-setup-item">
                <strong>Mechanism:</strong> {game_data?.mechanism.type}
              </div>
              <div className="game-setup-item">
                <strong>Initial Population:</strong>{" "}
                {game_data?.evolution.initial_population}
              </div>
              <div className="game-setup-item">
                <strong>Rounds:</strong> {game_data?.evolution.steps}
              </div>
            </div>
          </div>

          <div className="slider-section">
            <h2 className="upperbar-title">Round Select</h2>
            <div className="text-center">
              <RoundSlider
                maxRounds={round_data.length - 1}
                selectedRound={selected_round}
                onChange={set_selected_round}
              />
            </div>
          </div>



          <div className="chart-section">
            <h2 className="upperbar-title">Population Chart</h2>
            <PopulationChart population={populationChart} />
          </div>
        </div>

        <div className="content-area">
          <div className="agents-container">
            <div className="thoughts-section">
              <AgentThink thoughts={thoughts} />
            </div>
            <div className="stats-section">
              <AgentStats stats={stats} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}