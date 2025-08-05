
import "./listPage.scss";
import Filter from "../../components/filter/Filter"
import Card from "../../components/card/Card"
import CardSkeleton from "../../components/card/CardSkeleton"
import Map from "../../components/map/Map";
import MapSkeleton from "../../components/map/MapSkeleton";
import { useLoaderData, Await } from "react-router-dom";
import { Suspense } from "react";

function ListPage() {
  const data = useLoaderData();

  // Create an array of skeleton cards for loading state
  const skeletonCards = Array.from({ length: 6 }, (_, index) => (
    <CardSkeleton key={`skeleton-${index}`} />
  ));

  return <div className="listPage">
    <div className="listContainer">
      <div className="wrapper">
        <Filter/>
        <Suspense fallback={skeletonCards}>
          <Await resolve={data.postResponse}>
            {(posts) => (
              <>
                {posts.map(item => (
                  <Card key={item.id} item={item} />
                ))}
              </>
            )}
          </Await>
        </Suspense>
      </div>
    </div>
    <div className="mapContainer">
      <Suspense fallback={<MapSkeleton />}>
        <Await resolve={data.postResponse}>
          {(posts) => <Map items={posts} />}
        </Await>
      </Suspense>
    </div>
  </div>;
}

export default ListPage;
