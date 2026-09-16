import React from 'react';
import Layout from './Layout';
import MetricaGraduados from './common/MetricaGraduados';

const Dashboard = () => {
  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6 font-sans">
        <MetricaGraduados />
      </div>
    </Layout>
  );
};

export default Dashboard;