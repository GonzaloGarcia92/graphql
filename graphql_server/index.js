const { ApolloServer, gql } = require('apollo-server');

// Datos en memoria: equipos y jugadores
let teams = [
  { id: 1, name: 'Boca Juniors' },
  { id: 2, name: 'River Plate' },
  { id: 3, name: 'Independiente' },
  { id: 4, name: 'Racing Club' }
];
let players = [
  { id: 1, name: 'Carlos Tevez', teamId: 1 },
  { id: 2, name: 'Juan Román Riquelme', teamId: 1 },
  { id: 3, name: 'Martín Palermo', teamId: 1 },
  { id: 4, name: 'Enzo Pérez', teamId: 2 },
  { id: 5, name: 'Franco Armani', teamId: 2 },
  { id: 6, name: 'Gabriel Batistuta', teamId: 2 },
  { id: 7, name: 'Gabriel Batistuta', teamId: 3 }, // Batistuta jugó en tres equipos
  { id: 8, name: 'Ricardo Bochini', teamId: 3 },
  { id: 9, name: 'Lisandro López', teamId: 4 },
  { id: 10, name: 'Diego Milito', teamId: 4 },
  { id: 11, name: 'Lautaro Martínez', teamId: 4 },
  { id: 12, name: 'Gabriel Batistuta', teamId: 1 }
];
let nextPlayerId = 12;
let nextTeamId = 5;

// Esquema GraphQL actualizado
const typeDefs = gql`
  type Team {
    id: ID!
    name: String!
    players: [Player!]!
  }

  type Player {
    id: ID!
    name: String!
    team: Team!
  }

  type Query {
    teams: [Team!]!
    team(id: ID!): Team
    players: [Player!]!
    player(id: ID!): Player
  }

  type Mutation {
    addPlayer(name: String!, teamId: ID!): Player!
    updatePlayer(id: ID!, name: String, teamId: ID): Player
    deletePlayer(id: ID!): Boolean!
    addTeam(name: String!): Team!
    updateTeam(id: ID!, name: String): Team
    deleteTeam(id: ID!): Boolean!
  }
`;

// Resolvers actualizados
const resolvers = {
  Query: {
    teams: () => teams,
    team: (_, { id }) => teams.find(t => t.id == id),
    players: () => players,
    player: (_, { id }) => players.find(p => p.id == id),
  },
  Team: {
    players: (team) => players.filter(p => p.teamId == team.id),
  },
  Player: {
    team: (player) => teams.find(t => t.id == player.teamId),
  },
  Mutation: {
    addPlayer: (_, { name, teamId }) => {
      const team = teams.find(t => t.id == teamId);
      if (!team) throw new Error('Equipo no encontrado');
      const player = { id: nextPlayerId++, name, teamId: Number(teamId) };
      players.push(player);
      return player;
    },
    updatePlayer: (_, { id, name, teamId }) => {
      const player = players.find(p => p.id == id);
      if (!player) return null;
      if (name !== undefined) player.name = name;
      if (teamId !== undefined) {
        const team = teams.find(t => t.id == teamId);
        if (!team) throw new Error('Equipo no encontrado');
        player.teamId = Number(teamId);
      }
      return player;
    },
    deletePlayer: (_, { id }) => {
      const idx = players.findIndex(p => p.id == id);
      if (idx === -1) return false;
      players.splice(idx, 1);
      return true;
    },
    addTeam: (_, { name }) => {
      const team = { id: nextTeamId++, name };
      teams.push(team);
      return team;
    },
    updateTeam: (_, { id, name }) => {
      const team = teams.find(t => t.id == id);
      if (!team) return null;
      if (name !== undefined) team.name = name;
      return team;
    },
    deleteTeam: (_, { id }) => {
      const idx = teams.findIndex(t => t.id == id);
      if (idx === -1) return false;
      // Eliminar jugadores de ese equipo
      for (let i = players.length - 1; i >= 0; i--) {
        if (players[i].teamId == id) players.splice(i, 1);
      }
      teams.splice(idx, 1);
      return true;
    },
  },
};

// Servidor Apollo
const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`🚀 Servidor listo en ${url}`);
});
