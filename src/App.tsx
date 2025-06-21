
import './App.css';
import ATM from './components/ATM';
import CardTransactionLeaderboard from './components/CardTransactionLeaderboard';
import InfraBarChart from './components/InfraBarChart';


function App() {
  return (
    <main className=''>
      <section className="container mx-auto p-2">
        <h2 className="text-2xl font-bold mb-8 text-center">
          Indian Banking Data Visualizer
        </h2>
        <div className="flex flex-row flex-wrap gap-2 items-stretch w-full">
          <div className="flex-1 min-w-[560px] max-w-[600px] p-4">
            <InfraBarChart />
          </div>
          <div className="flex-1 min-w-[560px] max-w-[600px] p-4">
            <CardTransactionLeaderboard />
          </div>
          <div className="flex-1 min-w-[560px] max-w-[640px] p-4">
            <ATM />
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;
