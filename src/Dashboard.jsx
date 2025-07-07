import { useState } from 'react';
import './Dashboard.css';

const mockCustomers = [
  { id: 1, name: 'Alice Johnson', email: 'alice@email.com', offerUsed: '10% Off' },
  { id: 2, name: 'Bob Smith', email: 'bob@email.com', offerUsed: 'Free Coffee' },
  { id: 3, name: 'Charlie Lee', email: 'charlie@email.com', offerUsed: 'Buy 1 Get 1' },
];

function Dashboard() {
  const [customers] = useState(mockCustomers);

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Loyalty Offer Customers</h2>
      <div className="dashboard-list">
        {customers.length === 0 ? (
          <p className="dashboard-empty">No customers have used the loyalty offer yet.</p>
        ) : (
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Offer Used</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td>{customer.name}</td>
                  <td>{customer.email}</td>
                  <td>{customer.offerUsed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Dashboard; 