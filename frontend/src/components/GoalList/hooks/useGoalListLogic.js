// src/components/GoalList/hooks/useGoalListLogic.js
import { useState, useMemo } from "react";
import { useAppDispatch } from "../../../store/hooks";
import * as am5 from "@amcharts/amcharts5";
import { toast } from "react-toastify";

import {
  deleteGoal,
  updateGoalStatus,
  archiveGoal,
  fetchGoals,
} from "../../../store/features/goals/goalSlice";

export const useGoalListLogic = (goals) => {
  const dispatch = useAppDispatch();

  // Add missing state declarations
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("dueDate");
  const [viewType, setViewType] = useState("list");
  const [selectedGoals, setSelectedGoals] = useState([]);

  // src/components/GoalList/hooks/useGoalListLogic.js
  const filteredAndSortedGoals = useMemo(() => {
    return goals
      .filter((goal) => {
        // Match search term against goal title
        const matchesSearch = goal?.title
          ? goal.title.toLowerCase().includes(searchTerm.toLowerCase())
          : false;

        // Apply status filters
        if (filterStatus === "all") return matchesSearch;
        if (filterStatus === "completed")
          return goal.completionPercentage === 100 && matchesSearch;
        if (filterStatus === "in-progress")
          return (
            goal.completionPercentage > 0 &&
            goal.completionPercentage < 100 &&
            matchesSearch
          );
        if (filterStatus === "overdue") {
          const isOverdue =
            new Date() > new Date(goal.duration.endDate) &&
            goal.completionPercentage < 100;
          return isOverdue && matchesSearch;
        }
        return matchesSearch;
      })
      .sort((a, b) => {
        // Apply different sorting strategies
        switch (sortBy) {
          case "dueDate":
            return new Date(a.duration.endDate) - new Date(b.duration.endDate);
          case "priority":
            const priorityOrder = { High: 3, Medium: 2, Low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
          case "completion":
            return b.completionPercentage - a.completionPercentage;
          case "alphabetical":
            return a.title.localeCompare(b.title);
          case "created":
            return new Date(a.createdAt) - new Date(b.createdAt);
          case "lastModified":
            return new Date(b.updatedAt) - new Date(a.updatedAt);
          default:
            return 0;
        }
      });
  }, [goals, searchTerm, filterStatus, sortBy]);

  // Chart data calculation
  const chartData = useMemo(() => {
    const completed = goals.filter(
      (g) => g.completionPercentage === 100
    ).length;
    const inProgress = goals.filter(
      (g) => g.completionPercentage > 0 && g.completionPercentage < 100
    ).length;
    const notStarted = goals.filter((g) => g.completionPercentage === 0).length;
    const total = goals.length;

    return [
      {
        category: "Completed",
        value: total ? Math.round((completed / total) * 100) : 0,
        settings: { fill: am5.color("#1a73e8") },
      },
      {
        category: "In Progress",
        value: total ? Math.round((inProgress / total) * 100) : 0,
        settings: { fill: am5.color("#4285f4") },
      },
      {
        category: "Not Started",
        value: total ? Math.round((notStarted / total) * 100) : 0,
        settings: { fill: am5.color("#8ab4f8") },
      },
    ];
  }, [goals]);

  const handleGoalSelect = (goalId) => {
    setSelectedGoals((prev) =>
      prev.includes(goalId)
        ? prev.filter((id) => id !== goalId)
        : [...prev, goalId]
    );
  };

  // src/components/GoalList/hooks/useGoalListLogic.js

  const handleBulkDelete = () => {
    if (selectedGoals.length === 0) return;

    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${selectedGoals.length} selected goal(s)?`
    );

    if (confirmDelete) {
      // Dispatch delete actions for each selected goal
      selectedGoals.forEach((goalId) => {
        dispatch(deleteGoal(goalId))
          .unwrap()
          .then(() => {
            toast.success("Goal(s) deleted successfully!");
          })
          .catch((error) => {
            console.error("Failed to delete goal:", error);
            toast.error("Failed to delete goal(s).");
          });
      });
      setSelectedGoals([]);
    }
  };

  const handleBulkStatusUpdate = async () => {
    if (selectedGoals.length === 0) return;

    const confirmUpdate = window.confirm(
      `Do you want to mark ${selectedGoals.length} selected goal(s) as completed?`
    );

    if (confirmUpdate) {
      try {
        toast.promise(
          Promise.all(
            selectedGoals.map((goalId) =>
              dispatch(
                updateGoalStatus({
                  id: goalId,
                  status: {
                    completed: true,
                    completionPercentage: 100,
                  },
                })
              ).unwrap()
            )
          ),
          {
            pending: "Updating goal statuses...",
            success: "Goal statuses updated successfully!",
            error: "Failed to update goal statuses 🤯",
          }
        );

        // Clear selection after successful updates
        setSelectedGoals([]);

        // Optionally refresh the goals list
        dispatch(fetchGoals());
      } catch (error) {
        // Handle any errors that occurred during the updates
        console.error("Failed to update goals:", error);
      }
    }
  };

  const handleBulkArchive = () => {
    if (selectedGoals.length === 0) return;

    const confirmArchive = window.confirm(
      `Are you sure you want to archive ${selectedGoals.length} selected goal(s)?`
    );

    if (confirmArchive) {
      selectedGoals.forEach((goalId) => {
        dispatch(archiveGoal(goalId))
          .unwrap()
          .then(() => {
            toast.success("Goal(s) archived successfully!");
          })
          .catch((error) => {
            console.error("Failed to archive goal:", error);
            toast.error("Failed to archive goal(s).");
          });
      });
      setSelectedGoals([]);
    }
  };

  const exportGoals = () => {
    const dataStr = JSON.stringify(goals);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileDefaultName = "goals.json";
    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  return {
    searchTerm,
    filterStatus,
    sortBy,
    viewType,
    selectedGoals,
    setSearchTerm,
    setFilterStatus,
    setSortBy,
    setViewType,
    filteredAndSortedGoals,
    handleGoalSelect,
    handleBulkDelete,
    handleBulkStatusUpdate,
    handleBulkArchive,
    exportGoals,
    chartData,
  };
};
