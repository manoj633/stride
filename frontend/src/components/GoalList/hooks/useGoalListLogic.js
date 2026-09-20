// src/components/GoalList/hooks/useGoalListLogic.js
import { useState, useMemo } from "react";
import { useAppDispatch } from "../../../store/hooks";
import * as am5 from "@amcharts/amcharts5";
import { toast } from "react-toastify";

import {
  deleteGoal,
  updateGoalStatus,
  archiveGoal,
  unarchiveGoal,
  fetchGoals,
} from "../../../store/features/goals/goalSlice";
import { useConfirm } from "../../Common/ConfirmContext";

export const useGoalListLogic = (goals) => {
  const dispatch = useAppDispatch();
  const confirm = useConfirm();

  const currentYear = new Date().getFullYear();

  // Filter and sort state
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [archiveStatus, setArchiveStatus] = useState("active"); // "active" | "archived" | "all"
  const [selectedYear, setSelectedYear] = useState(currentYear); // number or "all"
  const [sortBy, setSortBy] = useState("lastModified");
  const [viewType, setViewType] = useState("list");
  const [selectedGoals, setSelectedGoals] = useState([]);

  // Dynamically compute available years based on a standard window + data history
  const availableYears = useMemo(() => {
    const yearsSet = new Set();
    const cy = new Date().getFullYear();
    for (let i = cy + 1; i >= cy - 3; i--) {
      yearsSet.add(i);
    }
    if (Array.isArray(goals)) {
      goals.forEach((g) => {
        if (g.duration?.startDate) {
          yearsSet.add(new Date(g.duration.startDate).getFullYear());
        }
        if (g.duration?.endDate) {
          yearsSet.add(new Date(g.duration.endDate).getFullYear());
        }
        if (g.createdAt) {
          yearsSet.add(new Date(g.createdAt).getFullYear());
        }
      });
    }
    const sorted = Array.from(yearsSet).sort((a, b) => b - a);
    return [...sorted, "all"];
  }, [goals]);

  // Unified shared filtering and sorting pipeline
  const filteredAndSortedGoals = useMemo(() => {
    if (!Array.isArray(goals)) return [];
    return goals
      .filter((goal) => {
        if (!goal) return false;
        // Match search term against goal title
        const matchesSearch = goal.title
          ? goal.title.toLowerCase().includes(searchTerm.toLowerCase())
          : false;

        // Apply status filters
        if (filterStatus === "completed") {
          if (!(goal.completionPercentage === 100 || goal.completed)) return false;
        } else if (filterStatus === "in-progress") {
          if (
            !(
              goal.completionPercentage > 0 &&
              goal.completionPercentage < 100 &&
              !goal.completed
            )
          )
            return false;
        } else if (filterStatus === "overdue") {
          const isOverdue =
            goal.duration?.endDate &&
            new Date() > new Date(goal.duration.endDate) &&
            goal.completionPercentage < 100 &&
            !goal.completed;
          if (!isOverdue) return false;
        }

        // Apply independent Archive status filter
        if (archiveStatus === "active") {
          if (goal.archived) return false;
        } else if (archiveStatus === "archived") {
          if (!goal.archived) return false;
        }
        // If "all", include both active and archived

        // Apply independent Year filter
        if (selectedYear !== "all") {
          const y = parseInt(selectedYear, 10);
          if (!isNaN(y)) {
            const startOfYear = new Date(y, 0, 1);
            const endOfYear = new Date(y, 11, 31, 23, 59, 59, 999);
            if (goal.duration?.startDate && goal.duration?.endDate) {
              const s = new Date(goal.duration.startDate);
              const e = new Date(goal.duration.endDate);
              if (!(s <= endOfYear && e >= startOfYear)) return false;
            } else if (goal.createdAt) {
              const c = new Date(goal.createdAt);
              if (!(c >= startOfYear && c <= endOfYear)) return false;
            }
          }
        }

        return matchesSearch;
      })
      .filter((goal) => {
        if (!goal) return false;
        if (!["thisWeek", "thisMonth", "thisYear"].includes(sortBy)) {
          return true;
        }
        if (!goal.duration?.startDate || !goal.duration?.endDate) {
          return true;
        }
        // Filtering logic for relative periods if selected in sort dropdown
        const now = new Date();
        const goalStartDate = new Date(goal.duration.startDate);
        const goalEndDate = new Date(goal.duration.endDate);

        switch (sortBy) {
          case "thisWeek": {
            const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
            startOfWeek.setHours(0, 0, 0, 0);
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(endOfWeek.getDate() + 6);
            endOfWeek.setHours(23, 59, 59, 999);
            return goalStartDate <= endOfWeek && goalEndDate >= startOfWeek;
          }
          case "thisMonth": {
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
            return goalStartDate <= endOfMonth && goalEndDate >= startOfMonth;
          }
          case "thisYear": {
            const startOfYear = new Date(now.getFullYear(), 0, 1);
            const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
            return goalStartDate <= endOfYear && goalEndDate >= startOfYear;
          }
          default:
            return true;
        }
      })
      .sort((a, b) => {
        if (!a || !b) return 0;
        // Apply different sorting strategies
        switch (sortBy) {
          case "dueDate":
            return (
              new Date(a.duration?.endDate || 0) -
              new Date(b.duration?.endDate || 0)
            );
          case "priority": {
            const priorityOrder = { High: 3, Medium: 2, Low: 1 };
            const pA = priorityOrder[a.priority] || 0;
            const pB = priorityOrder[b.priority] || 0;
            return pB - pA;
          }
          case "completion":
            return (b.completionPercentage || 0) - (a.completionPercentage || 0);
          case "alphabetical":
            return (a.title || "").localeCompare(b.title || "");
          case "created":
            return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
          case "lastModified":
          case "thisYear":
          case "thisMonth":
          case "thisWeek":
            return (
              new Date(b.updatedAt || b.createdAt || 0) -
              new Date(a.updatedAt || a.createdAt || 0)
            );
          default:
            return 0;
        }
      });
  }, [goals, searchTerm, filterStatus, archiveStatus, selectedYear, sortBy]);

  // Chart data calculation based on the active filtered scope
  const chartData = useMemo(() => {
    const completed = filteredAndSortedGoals.filter(
      (g) => g.completionPercentage === 100
    ).length;
    const inProgress = filteredAndSortedGoals.filter(
      (g) => g.completionPercentage > 0 && g.completionPercentage < 100
    ).length;
    const notStarted = filteredAndSortedGoals.filter((g) => g.completionPercentage === 0).length;
    const total = filteredAndSortedGoals.length;

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
  }, [filteredAndSortedGoals]);

  const handleGoalSelect = (goalId) => {
    setSelectedGoals((prev) =>
      prev.includes(goalId)
        ? prev.filter((id) => id !== goalId)
        : [...prev, goalId]
    );
  };

  // src/components/GoalList/hooks/useGoalListLogic.js

  const handleBulkDelete = async () => {
    if (selectedGoals.length === 0) return;

    const ok = await confirm({
      title: "Delete Selected Goals",
      message: `Are you sure you want to delete ${selectedGoals.length} selected goal(s)? All their tasks, subtasks, and notes will be permanently removed.`,
      confirmText: "Delete Goals",
      isDanger: true,
    });
    if (!ok) return;

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
  };

  const handleBulkStatusUpdate = async () => {
    if (selectedGoals.length === 0) return;

    const ok = await confirm({
      title: "Complete Goals",
      message: `Do you want to mark ${selectedGoals.length} selected goal(s) as completed?`,
      confirmText: "Mark Completed",
      isDanger: false,
    });
    if (!ok) return;

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
  };

  const handleBulkArchive = async () => {
    if (selectedGoals.length === 0) return;

    const ok = await confirm({
      title: "Archive Goals",
      message: `Are you sure you want to archive ${selectedGoals.length} selected goal(s)?`,
      confirmText: "Archive Goals",
      isDanger: false,
    });
    if (!ok) return;

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
  };

  const handleBulkUnarchive = async () => {
    if (selectedGoals.length === 0) return;

    const ok = await confirm({
      title: "Unarchive Goals",
      message: `Are you sure you want to unarchive ${selectedGoals.length} selected goal(s)?`,
      confirmText: "Unarchive Goals",
      isDanger: false,
    });
    if (!ok) return;

    selectedGoals.forEach((goalId) => {
      dispatch(unarchiveGoal(goalId))
        .unwrap()
        .then(() => {
          toast.success("Goal(s) unarchived successfully!");
        })
        .catch((error) => {
          console.error("Failed to unarchive goal:", error);
          toast.error("Failed to unarchive goal(s).");
        });
    });
    setSelectedGoals([]);
  };

  const handleUnarchiveGoal = (goalId) => {
    dispatch(unarchiveGoal(goalId))
      .unwrap()
      .then(() => {
        toast.success("Goal unarchived successfully!");
      })
      .catch((error) => {
        console.error("Failed to unarchive goal:", error);
        toast.error("Failed to unarchive goal.");
      });
  };

  const handleArchivePastGoals = (goalIds) => {
    if (!goalIds || goalIds.length === 0) return;
    Promise.all(goalIds.map((id) => dispatch(archiveGoal(id)).unwrap()))
      .then(() => {
        toast.success(`Archived ${goalIds.length} past goal(s)!`);
      })
      .catch((error) => {
        console.error("Failed to archive past goals:", error);
        toast.error("Failed to archive some goals.");
      });
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
    archiveStatus,
    selectedYear,
    availableYears,
    sortBy,
    viewType,
    selectedGoals,
    setSearchTerm,
    setFilterStatus,
    setArchiveStatus,
    setSelectedYear,
    setSortBy,
    setViewType,
    filteredAndSortedGoals,
    handleGoalSelect,
    handleBulkDelete,
    handleBulkStatusUpdate,
    handleBulkArchive,
    handleBulkUnarchive,
    handleUnarchiveGoal,
    handleArchivePastGoals,
    exportGoals,
    chartData,
  };
};
