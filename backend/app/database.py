import math
import os
from sqlalchemy import create_engine, event
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./fimms.db")

# PostgreSQL vs SQLite configuration
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False}
    )

    # Register SQLite custom functions for spatial distance calculation
    @event.listens_for(engine, "connect")
    def connect(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

        def haversine(lat1, lon1, lat2, lon2):
            if any(v is None for v in (lat1, lon1, lat2, lon2)):
                return None
            R = 6371.0  # Earth's radius in kilometers
            phi1 = math.radians(lat1)
            phi2 = math.radians(lat2)
            delta_phi = math.radians(lat2 - lat1)
            delta_lambda = math.radians(lon2 - lon1)
            a = (math.sin(delta_phi / 2.0) ** 2 +
                 math.cos(phi1) * math.cos(phi2) * (math.sin(delta_lambda / 2.0) ** 2))
            c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
            return R * c

        dbapi_connection.create_function("haversine_distance_km", 4, haversine)

else:
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
