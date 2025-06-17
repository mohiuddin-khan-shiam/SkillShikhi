import React from 'react';

export default function HowItWorks() {
  return (
    <section className="py-5 bg-light">
      <div className="container py-5">
        <div className="text-center mb-5">
          <div className="d-inline-flex align-items-center bg-primary bg-opacity-10 px-3 py-2 rounded-pill mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="#4338ca" className="bi bi-rocket me-2" viewBox="0 0 16 16">
              <path d="M8 8c.828 0 1.5-.895 1.5-2S8.828 4 8 4s-1.5.895-1.5 2 .672 2 1.5 2Z"/>
              <path d="M11.953 8.81c-.195-3.388-.968-5.507-1.777-6.819C9.707 1.233 9.23.751 8.857.454a3.495 3.495 0 0 0-.463-.315A2.19 2.19 0 0 0 8.25.064.546.546 0 0 0 8 0a.549.549 0 0 0-.266.073 2.312 2.312 0 0 0-.142.08 3.67 3.67 0 0 0-.459.33c-.37.308-.844.803-1.31 1.57-.805 1.322-1.577 3.433-1.774 6.756l-1.497 1.826-.004.005A2.5 2.5 0 0 0 2 12.202v.993c0 .167.048.33.139.468l.003.007c.084.127.194.25.34.36.114.085.292.177.48.255.358.149.85.246 1.215.246h6.646c.365 0 .857-.097 1.215-.246.188-.078.366-.17.48-.255a2.007 2.007 0 0 0 .34-.36l.003-.007A.987.987 0 0 0 14 13.195v-.993a2.5 2.5 0 0 0-.548-1.564l-1.499-1.828ZM12 12.795v.205H4v-.5a1.5 1.5 0 0 1 .33-.943l1.709-2.082.129-.202.099-2.266c.294.452.571.688.798.752l.532.148c.115.032.242.062.38.107.218.073.458.173.704.313.42.24.853.57.882 1.177.03.606-.45.989-.853 1.298-.354.27-.674.443-.874.533-.09.032-.42.148-.195.226-.115.059-.215.116-.313.176-.123.075-.237.156-.313.257-.123.167-.297.463-.297.945z"/>
            </svg>
            <span className="text-primary fw-medium small">PLATFORM OVERVIEW</span>
          </div>
          <h2 className="display-5 fw-bold text-primary mb-3">How SkillShikhi Works</h2>
          <p className="lead text-secondary mx-auto" style={{ maxWidth: '700px' }}>
            Our platform makes it easy to discover, connect, and share knowledge within your community.
          </p>
        </div>

        <div className="row g-4">
          {/* Card 1: Find a Skill */}
          <div className="col-md-4">
            <div className="card h-100 border-0 shadow-sm rounded-4 hover-card">
              <div className="card-body p-4">
                <div className="feature-icon bg-primary bg-opacity-10 rounded-3 p-3 d-inline-flex mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#4338ca" className="bi bi-search" viewBox="0 0 16 16">
                    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                  </svg>
                </div>
                <h3 className="fs-4 fw-bold text-primary mb-3">Find a Skill</h3>
                <p className="text-secondary mb-0">
                  Browse through various skills offered by people in your community. Filter by categories, difficulty level, and more.
                </p>
                <div className="card-actions mt-4 opacity-50 text-end">
                  <div className="small text-primary">• • •</div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Connect */}
          <div className="col-md-4">
            <div className="card h-100 border-0 shadow-sm rounded-4 hover-card">
              <div className="card-body p-4">
                <div className="feature-icon bg-info bg-opacity-10 rounded-3 p-3 d-inline-flex mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#0ea5e9" className="bi bi-chat-dots" viewBox="0 0 16 16">
                    <path d="M5 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm4 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
                    <path d="m2.165 15.803.02-.004c1.83-.363 2.948-.842 3.468-1.105A9.06 9.06 0 0 0 8 15c4.418 0 8-3.134 8-7s-3.582-7-8-7-8 3.134-8 7c0 1.76.743 3.37 1.97 4.6a10.437 10.437 0 0 1-.524 2.318l-.003.011a10.722 10.722 0 0 1-.244.637c-.079.186.074.394.273.362a21.673 21.673 0 0 0 .693-.125zm.8-3.108a1 1 0 0 0-.287-.801C1.618 10.83 1 9.468 1 8c0-3.192 3.004-6 7-6s7 2.808 7 6c0 3.193-3.004 6-7 6a8.06 8.06 0 0 1-2.088-.272 1 1 0 0 0-.711.074c-.387.196-1.24.57-2.634.893a10.97 10.97 0 0 0 .398-2z"/>
                  </svg>
                </div>
                <h3 className="fs-4 fw-bold text-info mb-3">Connect</h3>
                <p className="text-secondary mb-0">
                  Request to learn from skilled teachers or offer to share your expertise. Schedule sessions that work for both parties.
                </p>
                <div className="card-actions mt-4 opacity-50 text-end">
                  <div className="small text-info">• • •</div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Grow Together */}
          <div className="col-md-4">
            <div className="card h-100 border-0 shadow-sm rounded-4 hover-card">
              <div className="card-body p-4">
                <div className="feature-icon bg-success bg-opacity-10 rounded-3 p-3 d-inline-flex mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#10b981" className="bi bi-lightning-charge" viewBox="0 0 16 16">
                    <path d="M11.251.068a.5.5 0 0 1 .227.58L9.677 6.5H13a.5.5 0 0 1 .364.843l-8 8.5a.5.5 0 0 1-.842-.49L6.323 9.5H3a.5.5 0 0 1-.364-.843l8-8.5a.5.5 0 0 1 .615-.09zM4.157 8.5H7a.5.5 0 0 1 .478.647L6.11 13.59l5.732-6.09H9a.5.5 0 0 1-.478-.647L9.89 2.41 4.157 8.5z"/>
                  </svg>
                </div>
                <h3 className="fs-4 fw-bold text-success mb-3">Grow Together</h3>
                <p className="text-secondary mb-0">
                  Learn, teach, and build a stronger community through skill sharing. Rate sessions and leave feedback to help others.
                </p>
                <div className="card-actions mt-4 opacity-50 text-end">
                  <div className="small text-success">• • •</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .hover-card {
          transition: all 0.3s ease;
        }
        
        .hover-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08) !important;
        }
        
        .feature-icon {
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </section>
  );
} 