#include "motis/paxmon/print_stats.h"

#include "fmt/format.h"

#include "motis/core/common/logging.h"

using namespace motis::logging;

namespace motis::paxmon {

void print_graph_stats(graph_statistics const& graph_stats) {
  LOG(info) << fmt::format("{:L} passenger groups, {:L} passengers",
                           graph_stats.passenger_groups_,
                           graph_stats.passengers_);
  LOG(info) << fmt::format("{:L} graph nodes ({:L} canceled)",
                           graph_stats.nodes_, graph_stats.canceled_nodes_);
  LOG(info) << fmt::format(
      "{:L} graph edges ({:L} canceled): {:L} trip + {:L} interchange + {:L} "
      "wait + {:L} through",
      graph_stats.edges_, graph_stats.canceled_edges_, graph_stats.trip_edges_,
      graph_stats.interchange_edges_, graph_stats.wait_edges_,
      graph_stats.through_edges_);
  LOG(info) << fmt::format("{:L} stations", graph_stats.stations_);
  LOG(info) << fmt::format("{:L} trips", graph_stats.trips_);
  LOG(info) << fmt::format("over capacity: {:L} trips, {:L} edges",
                           graph_stats.trips_over_capacity_,
                           graph_stats.edges_over_capacity_);
  LOG(info) << fmt::format("broken: {:L} interchange edges, {:L} groups",
                           graph_stats.broken_edges_,
                           graph_stats.broken_passenger_groups_);
}

void print_allocator_stats(graph const& g) {
  LOG(info) << fmt::format(
      "passenger group allocator: {:L} groups, {:.2f} MiB currently allocated, "
      "{:L} free list entries, {:L} total allocations, {:L} total "
      "deallocations",
      g.passenger_group_allocator_.elements_allocated(),
      static_cast<double>(g.passenger_group_allocator_.bytes_allocated()) /
          (1024.0 * 1024.0),
      g.passenger_group_allocator_.free_list_size(),
      g.passenger_group_allocator_.allocation_count(),
      g.passenger_group_allocator_.release_count());
}

}  // namespace motis::paxmon
