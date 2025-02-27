declare module 'nba-api-client' {
  export default {
    leagueLeaders: (params: any) => Promise<any>,
    playerStats: (params: any) => Promise<any>,
    teamPlayerStats: (params: any) => Promise<any>
  };
} 